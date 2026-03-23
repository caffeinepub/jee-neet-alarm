import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import type { Alarm } from "../backend.d";
import { useDeleteAlarm, useUpdateAlarm } from "../hooks/useQueries";
import { SubjectBadge } from "./SubjectBadge";

interface Props {
  alarm: Alarm;
  index: number;
}

export function AlarmItem({ alarm, index }: Props) {
  const deleteAlarm = useDeleteAlarm();
  const updateAlarm = useUpdateAlarm();

  const toggleEnabled = () => {
    updateAlarm.mutate({
      id: alarm.id,
      timeHours: alarm.timeHours,
      timeMinutes: alarm.timeMinutes,
      alarmLabel: alarm.alarmLabel,
      subject: alarm.subject,
      enabled: !alarm.enabled,
    });
  };

  const hours = String(Number(alarm.timeHours)).padStart(2, "0");
  const mins = String(Number(alarm.timeMinutes)).padStart(2, "0");

  return (
    <div
      className={`glass-card rounded-2xl px-5 py-4 flex items-center gap-4 transition-all ${alarm.enabled ? "border-teal/20" : "opacity-50"}`}
      data-ocid={`alarm.item.${index}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-foreground">
            {hours}:{mins}
          </span>
          <SubjectBadge subject={alarm.subject} />
        </div>
        <p className="text-muted-foreground text-sm mt-0.5 truncate">
          {alarm.alarmLabel}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Switch
          checked={alarm.enabled}
          onCheckedChange={toggleEnabled}
          data-ocid="alarm.toggle"
          className="data-[state=checked]:bg-primary"
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          onClick={() => deleteAlarm.mutate(alarm.id)}
          data-ocid={`alarm.delete_button.${index}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
