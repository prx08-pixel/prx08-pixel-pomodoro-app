export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function previousDayKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year ?? 0, month ?? 0, day ?? 1);
  date.setDate(date.getDate() - 1);
  return dayKey(date.getTime());
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function todaysFocusMs(
  sessions: Array<{ mode: string; completedAt: number; durationMs: number }>,
  today = dayKey(Date.now()),
): number {
  return sessions
    .filter((session) => session.mode === "pomodoro" && dayKey(session.completedAt) === today)
    .reduce((sum, session) => sum + session.durationMs, 0);
}

export function todaysCompletedTasks(
  tasks: Array<{ completed: boolean; completedAt: number | null }>,
  today = dayKey(Date.now()),
): number {
  return tasks.filter(
    (task) => task.completed && task.completedAt !== null && dayKey(task.completedAt) === today,
  ).length;
}
