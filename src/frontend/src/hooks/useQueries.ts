import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Alarm, Question } from "../backend.d";
import { useActor } from "./useActor";

export function useListAlarms() {
  const { actor, isFetching } = useActor();
  return useQuery<Alarm[]>({
    queryKey: ["alarms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAlarms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, number]>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return [0n, 0];
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAlarm() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      timeHours: bigint;
      timeMinutes: bigint;
      alarmLabel: string;
      subject: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createAlarm(
        data.timeHours,
        data.timeMinutes,
        data.alarmLabel,
        data.subject,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alarms"] }),
  });
}

export function useUpdateAlarm() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      timeHours: bigint;
      timeMinutes: bigint;
      alarmLabel: string;
      subject: string;
      enabled: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAlarm(
        data.id,
        data.timeHours,
        data.timeMinutes,
        data.alarmLabel,
        data.subject,
        data.enabled,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alarms"] }),
  });
}

export function useDeleteAlarm() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAlarm(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alarms"] }),
  });
}

export function useRecordDismiss() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { alarmId: bigint; attempts: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordDismiss(data.alarmId, data.attempts);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export async function fetchRandomQuestion(
  actor: { getRandomQuestion: (s: string) => Promise<Question | null> },
  subject: string,
): Promise<Question | null> {
  return actor.getRandomQuestion(subject);
}
