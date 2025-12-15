export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  streakFreezes: number;
}

export type HabitFrequency = 'daily' | 'weekly' | 'specific_days';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'Health' | 'Productivity' | 'Mindfulness' | 'Learning' | 'Fitness';
  frequency: HabitFrequency;
  specificDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  target: number;
  unit: string;
  streak: number;
  completedToday: boolean;
  lastCompletedDate?: string; // ISO String YYYY-MM-DD
  history: Record<string, boolean>; // Map "YYYY-MM-DD" -> true
  order: number;
}

export interface Quest {
  id: string;
  title: string;
  target: number;
  progress: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
  category: 'streak' | 'total' | 'special';
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'powerup' | 'theme' | 'freeze';
}

export interface MoodLog {
  date: string;
  rating: number; // 1-5
  note?: string;
}

export interface AnalyticsInsights {
  streakPrediction: string;
  optimalSchedule: string;
  moodCorrelation: string;
  generatedAt: number;
}

// Context Type
export interface HabitContextType {
  user: User;
  habits: Habit[];
  quests: Quest[];
  badges: Badge[];
  moodLog: MoodLog[];
  toggleHabit: (id: string) => void;
  addHabit: (habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (newOrder: Habit[]) => void;
  logMood: (rating: number) => void;
  buyItem: (item: ShopItem) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  currentView: 'dashboard' | 'analytics';
  setCurrentView: (view: 'dashboard' | 'analytics') => void;
}
