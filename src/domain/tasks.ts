import { TASK_COMPLETE_BONUS } from "./defaults";
import type { AppState, Task, TasksState } from "./types";

export function addTask(
  tasks: TasksState,
  title: string,
  estimatedPomodoros: number,
  now: number,
): TasksState {
  const trimmed = title.trim();
  if (!trimmed) return tasks;

  const task: Task = {
    id: `task-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: trimmed.slice(0, 80),
    estimatedPomodoros: Math.max(0, Math.min(12, Math.round(estimatedPomodoros))),
    completedPomodoros: 0,
    completed: false,
    createdAt: now,
    completedAt: null,
    bonusAwarded: false,
  };

  return {
    items: [task, ...tasks.items],
    activeTaskId: tasks.activeTaskId ?? task.id,
  };
}

export function logPomodoroOnActiveTask(state: AppState): AppState {
  const activeId = state.tasks.activeTaskId;
  if (!activeId) return state;

  return {
    ...state,
    tasks: {
      ...state.tasks,
      items: state.tasks.items.map((task) =>
        task.id === activeId && !task.completed
          ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
          : task,
      ),
    },
  };
}

export function completeTask(state: AppState, taskId: string, now: number): AppState {
  const task = state.tasks.items.find((item) => item.id === taskId);
  if (!task || task.completed) return state;

  const awardBonus = !task.bonusAwarded;

  return {
    ...state,
    economy: awardBonus
      ? { ...state.economy, starCoins: state.economy.starCoins + TASK_COMPLETE_BONUS }
      : state.economy,
    tasks: {
      items: state.tasks.items.map((item) =>
        item.id === taskId
          ? {
              ...item,
              completed: true,
              completedAt: now,
              bonusAwarded: true,
            }
          : item,
      ),
      activeTaskId: state.tasks.activeTaskId === taskId ? null : state.tasks.activeTaskId,
    },
  };
}
