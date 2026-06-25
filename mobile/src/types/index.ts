export interface Entry {
  date: string;
  completed: boolean;
  comment: string;
}

export interface Habit {
  _id: string;
  title: string;
  isArchived: boolean;
  entries: Entry[];
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export interface HabitAnalytics {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  last30Days: { date: string; completed: boolean }[];
}

export interface HabitWithAnalytics extends Habit {
  analytics?: HabitAnalytics;
}
