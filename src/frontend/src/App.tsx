import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BarChart2, Bell, Clock, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Alarm, Question } from "./backend.d";
import { AddAlarmModal } from "./components/AddAlarmModal";
import { AlarmItem } from "./components/AlarmItem";
import { AlarmRinging } from "./components/AlarmRinging";
import { DigitalClock } from "./components/DigitalClock";
import { StatsScreen } from "./components/StatsScreen";
import { useActor } from "./hooks/useActor";
import { useListAlarms } from "./hooks/useQueries";

type Tab = "home" | "stats";

const FIRED_KEY = "alarm_fired_today";

function getFiredToday(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date: string; ids: string[] };
    const today = new Date().toDateString();
    if (parsed.date !== today) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function saveFiredToday(ids: Set<string>) {
  localStorage.setItem(
    FIRED_KEY,
    JSON.stringify({ date: new Date().toDateString(), ids: Array.from(ids) }),
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [showAddModal, setShowAddModal] = useState(false);
  const [ringAlarm, setRingAlarm] = useState<Alarm | null>(null);
  const [ringQuestion, setRingQuestion] = useState<Question | null>(null);
  const firedRef = useRef<Set<string>>(getFiredToday());

  const { data: alarms = [], isLoading } = useListAlarms();
  const { actor } = useActor();

  const checkAlarms = useCallback(async () => {
    if (!actor || ringAlarm) return;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    for (const alarm of alarms) {
      if (!alarm.enabled) continue;
      const ah = Number(alarm.timeHours);
      const am = Number(alarm.timeMinutes);
      if (ah !== h || am !== m) continue;

      const key = `${alarm.id}_${h}_${m}`;
      if (firedRef.current.has(key)) continue;

      firedRef.current.add(key);
      saveFiredToday(firedRef.current);

      const question = await actor
        .getRandomQuestion(alarm.subject)
        .catch(() => null);
      setRingQuestion(question);
      setRingAlarm(alarm);
      break;
    }
  }, [actor, alarms, ringAlarm]);

  useEffect(() => {
    const interval = setInterval(checkAlarms, 30_000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [checkAlarms]);

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();
    const t = setTimeout(() => {
      firedRef.current = new Set();
      saveFiredToday(firedRef.current);
    }, msUntilMidnight);
    return () => clearTimeout(t);
  }, []);

  const handleDismissed = () => {
    setRingAlarm(null);
    setRingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      <AnimatePresence>
        {ringAlarm && (
          <AlarmRinging
            alarm={ringAlarm}
            question={ringQuestion}
            onDismissed={handleDismissed}
          />
        )}
      </AnimatePresence>

      <AddAlarmModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <div className="max-w-lg mx-auto px-4 pb-24">
        <header className="pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-teal" />
            </div>
            <span className="font-bold text-lg text-foreground">
              StudyAlarm
            </span>
          </div>
          <span className="text-xs text-muted-foreground">JEE / NEET</span>
        </header>

        <main>
          {tab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl">
                <DigitalClock />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground text-lg">Alarms</h2>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  onClick={() => setShowAddModal(true)}
                  data-ocid="alarm.open_modal_button"
                >
                  <Plus className="w-4 h-4" />
                  Add Alarm
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-3" data-ocid="alarm.loading_state">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl h-20 animate-pulse"
                    />
                  ))}
                </div>
              ) : alarms.length === 0 ? (
                <div
                  className="glass-card rounded-2xl p-10 text-center"
                  data-ocid="alarm.empty_state"
                >
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">
                    No alarms yet
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tap "Add Alarm" to create your first study alarm
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alarms.map((alarm, i) => (
                    <AlarmItem
                      key={String(alarm.id)}
                      alarm={alarm}
                      index={i + 1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <StatsScreen />
            </motion.div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-border flex items-center justify-around py-3 px-4">
        <button
          type="button"
          className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-colors ${
            tab === "home"
              ? "text-teal"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("home")}
          data-ocid="nav.link"
        >
          <Clock className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          type="button"
          className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-colors ${
            tab === "stats"
              ? "text-teal"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("stats")}
          data-ocid="stats.link"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-xs font-medium">Stats</span>
        </button>
      </nav>

      <footer className="text-center py-4 mt-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
