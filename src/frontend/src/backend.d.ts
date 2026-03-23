import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Alarm {
    id: bigint;
    subject: string;
    enabled: boolean;
    alarmLabel: string;
    timeMinutes: bigint;
    timeHours: bigint;
}
export interface Question {
    id: bigint;
    topic: string;
    subject: string;
    correctIndex: bigint;
    questionText: string;
    options: Array<string>;
}
export interface backendInterface {
    createAlarm(timeHours: bigint, timeMinutes: bigint, alarmLabel: string, subject: string): Promise<bigint>;
    deleteAlarm(id: bigint): Promise<void>;
    getRandomQuestion(subject: string): Promise<Question | null>;
    getStats(): Promise<[bigint, number]>;
    listAlarms(): Promise<Array<Alarm>>;
    recordDismiss(alarmId: bigint, attempts: bigint): Promise<void>;
    updateAlarm(id: bigint, timeHours: bigint, timeMinutes: bigint, alarmLabel: string, subject: string, enabled: boolean): Promise<void>;
}
