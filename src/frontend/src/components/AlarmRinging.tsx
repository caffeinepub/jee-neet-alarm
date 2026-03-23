import { Bell, CheckCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Alarm, Question } from "../backend.d";
import { useRecordDismiss } from "../hooks/useQueries";
import { SubjectBadge } from "./SubjectBadge";

interface Props {
  alarm: Alarm;
  question: Question | null;
  onDismissed: () => void;
}

export function AlarmRinging({ alarm, question, onDismissed }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const recordDismiss = useRecordDismiss();

  const stopAlarmSound = useCallback(() => {
    for (const osc of oscillatorsRef.current) {
      try {
        osc.stop();
      } catch {}
    }
    oscillatorsRef.current = [];
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  const startAlarmSound = useCallback(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const playBeep = (startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.setValueAtTime(660, startTime + 0.1);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.setValueAtTime(0, startTime + 0.2);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
      oscillatorsRef.current.push(osc);
    };

    const scheduleBeeps = () => {
      if (!audioCtxRef.current) return;
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        playBeep(now + i * 0.3);
      }
    };
    scheduleBeeps();
    const interval = setInterval(() => {
      if (!audioCtxRef.current) {
        clearInterval(interval);
        return;
      }
      scheduleBeeps();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = startAlarmSound();
    return () => {
      cleanup?.();
      stopAlarmSound();
    };
  }, [startAlarmSound, stopAlarmSound]);

  const handleAnswer = async (idx: number) => {
    if (success) return;
    setSelected(idx);
    const att = attempts + 1;
    setAttempts(att);

    const correctIdx = Number(question?.correctIndex ?? -1);
    if (idx === correctIdx) {
      stopAlarmSound();
      setSuccess(true);
      await recordDismiss.mutateAsync({
        alarmId: alarm.id,
        attempts: BigInt(att),
      });
      setTimeout(onDismissed, 1800);
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSelected(null);
      }, 500);
    }
  };

  const hours = String(Number(alarm.timeHours)).padStart(2, "0");
  const mins = String(Number(alarm.timeMinutes)).padStart(2, "0");

  const OPTION_LABELS = ["A", "B", "C", "D"];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-alarm-bg p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-ocid="alarm.modal"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.05_30)] via-[oklch(0.08_0.03_30)] to-[oklch(0.05_0.02_240)] opacity-95" />

      <div className="relative z-10 w-full max-w-lg">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="w-24 h-24 text-teal mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-teal">Correct!</h2>
              <p className="text-muted-foreground mt-2">
                Alarm dismissed. Time to study! 💪
              </p>
            </motion.div>
          ) : (
            <motion.div key="ringing" className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange/20 border-2 border-orange animate-pulse-glow mb-4">
                  <Bell className="w-10 h-10 text-orange animate-ring-icon" />
                </div>
                <div className="font-mono text-5xl font-bold text-orange mb-1">
                  {hours}:{mins}
                </div>
                <div className="text-xl font-semibold text-foreground">
                  {alarm.alarmLabel}
                </div>
                <div className="mt-2">
                  <SubjectBadge subject={alarm.subject} />
                </div>
              </div>

              {question ? (
                <div
                  className={`glass-card rounded-2xl p-5 ${shake ? "animate-shake" : ""}`}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold">
                    🧠 Solve to dismiss • {question.topic}
                  </p>
                  <p className="text-foreground font-medium text-base leading-relaxed mb-5">
                    {question.questionText}
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {question.options.map((opt, i) => {
                      let cls =
                        "glass-card border rounded-xl px-4 py-3 text-left text-sm font-medium transition-all cursor-pointer hover:border-teal/60 ";
                      if (selected === i) {
                        const correctIdx = Number(question.correctIndex);
                        cls +=
                          i === correctIdx
                            ? "border-teal bg-teal/10 text-teal"
                            : "border-destructive bg-destructive/10 text-destructive-foreground";
                      } else {
                        cls += "border-border text-foreground hover:bg-card/60";
                      }
                      const label = OPTION_LABELS[i] ?? String(i + 1);
                      return (
                        <button
                          key={label}
                          type="button"
                          className={cls}
                          onClick={() => handleAnswer(i)}
                          data-ocid="alarm.button"
                        >
                          <span className="font-bold text-muted-foreground mr-2">
                            {label}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selected !== null &&
                    selected !== Number(question.correctIndex) && (
                      <div className="flex items-center gap-2 mt-4 text-destructive text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Wrong! Try again — alarm stays on!
                      </div>
                    )}

                  {attempts > 0 && (
                    <p className="text-muted-foreground text-xs mt-3">
                      Attempts: {attempts}
                    </p>
                  )}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">
                  Loading question...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
