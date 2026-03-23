import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { Alarm } from "../backend.d";
import { useCreateAlarm, useUpdateAlarm } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  editAlarm?: Alarm | null;
}

export function AddAlarmModal({ open, onClose, editAlarm }: Props) {
  const [hours, setHours] = useState(
    editAlarm ? String(Number(editAlarm.timeHours)).padStart(2, "0") : "07",
  );
  const [minutes, setMinutes] = useState(
    editAlarm ? String(Number(editAlarm.timeMinutes)).padStart(2, "0") : "00",
  );
  const [label, setLabel] = useState(editAlarm?.alarmLabel ?? "");
  const [subject, setSubject] = useState(editAlarm?.subject ?? "JEE");

  const create = useCreateAlarm();
  const update = useUpdateAlarm();
  const isPending = create.isPending || update.isPending;

  const handleSave = async () => {
    const h = BigInt(Number.parseInt(hours, 10));
    const m = BigInt(Number.parseInt(minutes, 10));
    const lbl = label.trim() || "Study Alarm";
    if (editAlarm) {
      await update.mutateAsync({
        id: editAlarm.id,
        timeHours: h,
        timeMinutes: m,
        alarmLabel: lbl,
        subject,
        enabled: editAlarm.enabled,
      });
    } else {
      await create.mutateAsync({
        timeHours: h,
        timeMinutes: m,
        alarmLabel: lbl,
        subject,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="glass-card border-border max-w-sm"
        data-ocid="alarm.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground font-bold text-xl">
            {editAlarm ? "Edit Alarm" : "New Alarm"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">
              Time
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(e.target.value.padStart(2, "0"))}
                className="text-center font-mono text-2xl font-bold bg-input border-border text-foreground w-20"
                data-ocid="alarm.input"
              />
              <span className="text-2xl font-bold text-teal">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value.padStart(2, "0"))}
                className="text-center font-mono text-2xl font-bold bg-input border-border text-foreground w-20"
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">
              Label
            </Label>
            <Input
              placeholder="e.g. Morning Physics"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">
              Subject
            </Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger
                className="bg-input border-border text-foreground"
                data-ocid="alarm.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="JEE">JEE</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
            data-ocid="alarm.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="alarm.save_button"
          >
            {isPending ? "Saving..." : "Save Alarm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
