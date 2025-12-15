import { User, Habit, Quest, Badge, ShopItem } from './types';
import { Trophy, Flame, Zap, Calendar, Heart, BookOpen, Dumbbell, Briefcase } from 'lucide-react';
import React from 'react';

export const APP_VERSION = '1.0.0';

// Helper to generate mock history with date keys
const generateMockHistory = (statuses: boolean[]): Record<string, boolean> => {
  const history: Record<string, boolean> = {};
  const today = new Date();
  statuses.forEach((status, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (statuses.length - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    history[dateStr] = status;
  });
  return history;
};

export const INITIAL_USER: User = {
  id: 'u1',
  name: 'New Player',
  email: 'player@habitforge.com',
  avatar: 'https://picsum.photos/100/100',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  streakFreezes: 0,
};

export const MOCK_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness',
    category: 'Mindfulness',
    frequency: 'daily',
    target: 10,
    unit: 'min',
    streak: 0,
    completedToday: false,
    history: {},
    order: 0
  },
  {
    id: 'h2',
    name: 'Drink Water',
    description: '8 glasses daily',
    category: 'Health',
    frequency: 'daily',
    target: 8,
    unit: 'glasses',
    streak: 0,
    completedToday: false,
    history: {},
    order: 1
  }
];

// Pool of templates to generate infinite quests
export const QUEST_TEMPLATES = [
    { title: 'Complete {n} Habits', type: 'habit_count', min: 1, max: 5, xpPerUnit: 20, coinsPerUnit: 10 },
    { title: 'Reach {n} Day Streak', type: 'streak_target', min: 3, max: 7, xpPerUnit: 50, coinsPerUnit: 25 },
    { title: 'Log Mood', type: 'mood_log', min: 1, max: 1, xpPerUnit: 30, coinsPerUnit: 10 },
    { title: 'Earn {n} Coins', type: 'earn_coins', min: 10, max: 50, xpPerUnit: 2, coinsPerUnit: 0 },
    { title: 'Gain {n} XP', type: 'earn_xp', min: 50, max: 200, xpPerUnit: 0, coinsPerUnit: 0.5 },
];

export const DAILY_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Complete 1 Habit',
    target: 1,
    progress: 0,
    rewardXp: 50,
    rewardCoins: 20,
    completed: false,
  },
  {
    id: 'q2',
    title: 'Log Your Mood',
    target: 1,
    progress: 0,
    rewardXp: 30,
    rewardCoins: 10,
    completed: false,
  },
  {
    id: 'q3',
    title: 'Perfect Streak',
    target: 3, 
    progress: 0,
    rewardXp: 100,
    rewardCoins: 50,
    completed: false,
  },
];

export const RECENT_BADGES: Badge[] = [];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 's1',
    name: 'Streak Freeze',
    description: 'Protect your streak for one missed day',
    cost: 50,
    icon: '❄️',
    type: 'freeze',
  },
  {
    id: 's2',
    name: 'Golden Theme',
    description: 'Unlock the golden avatar border',
    cost: 500,
    icon: '👑',
    type: 'theme',
  },
  {
    id: 's3',
    name: 'Double XP Potion',
    description: '2x XP for the next 24 hours',
    cost: 150,
    icon: '🧪',
    type: 'powerup',
  },
];

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Health: <Heart className="w-5 h-5 text-red-500" />,
  Fitness: <Dumbbell className="w-5 h-5 text-blue-500" />,
  Mindfulness: <Zap className="w-5 h-5 text-yellow-500" />,
  Learning: <BookOpen className="w-5 h-5 text-purple-500" />,
  Productivity: <Briefcase className="w-5 h-5 text-green-500" />,
};