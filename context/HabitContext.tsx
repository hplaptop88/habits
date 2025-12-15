import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Habit, Quest, Badge, MoodLog, ShopItem, HabitContextType } from '../types';
import { INITIAL_USER, MOCK_HABITS, DAILY_QUESTS, QUEST_TEMPLATES, RECENT_BADGES } from '../constants';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { playSound } from '../services/soundService';

const HabitContext = createContext<HabitContextType & { resetApp: () => void } | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State ---
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [quests, setQuests] = useState<Quest[]>(DAILY_QUESTS);
  const [badges, setBadges] = useState<Badge[]>(RECENT_BADGES);
  const [moodLog, setMoodLog] = useState<MoodLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');

  // --- Persistence ---
  useEffect(() => {
    const storedUser = localStorage.getItem('hf_user');
    const storedHabits = localStorage.getItem('hf_habits');
    const storedMood = localStorage.getItem('hf_mood');
    const storedQuests = localStorage.getItem('hf_quests');
    const storedTheme = localStorage.getItem('hf_theme');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedHabits) setHabits(JSON.parse(storedHabits));
    if (storedMood) setMoodLog(JSON.parse(storedMood));
    if (storedQuests) setQuests(JSON.parse(storedQuests));
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hf_user', JSON.stringify(user));
    localStorage.setItem('hf_habits', JSON.stringify(habits));
    localStorage.setItem('hf_mood', JSON.stringify(moodLog));
    localStorage.setItem('hf_quests', JSON.stringify(quests));
  }, [user, habits, moodLog, quests]);

  // --- Helpers ---
  const generateQuest = useCallback((): Quest => {
    // Basic scaling logic
    const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
    
    // Scale difficulty with level
    const levelMultiplier = 1 + (user.level * 0.15); // 15% harder per level
    const min = Math.ceil(template.min * levelMultiplier);
    const max = Math.ceil(template.max * levelMultiplier);
    
    const target = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return {
      id: `q-${Date.now()}-${Math.random()}`,
      title: template.title.replace('{n}', target.toString()),
      target: target,
      progress: 0,
      rewardXp: Math.floor(target * template.xpPerUnit * levelMultiplier) + 20,
      rewardCoins: Math.floor(target * template.coinsPerUnit * levelMultiplier) + 10,
      completed: false
    };
  }, [user.level]);

  const updateQuests = (type: 'habit' | 'mood' | 'coin' | 'xp', amount: number = 1) => {
    let questCompleted = false;
    let xpGained = 0;
    let coinsGained = 0;

    setQuests(prev => {
        const nextQuests = prev.map(q => {
            if (q.completed) return q; 
            
            let newProgress = q.progress;
            if (type === 'habit' && q.title.includes('Habit')) newProgress += amount;
            if (type === 'mood' && q.title.includes('Mood')) newProgress += amount;
            
            if (newProgress >= q.target && !q.completed) {
                questCompleted = true;
                xpGained += q.rewardXp;
                coinsGained += q.rewardCoins;
                return { ...q, progress: q.target, completed: true };
            }
            return { ...q, progress: Math.min(newProgress, q.target) };
        });

        // Replace completed quests immediately with new generated quests
        if (questCompleted) {
            return nextQuests.map(q => {
                if (q.completed) return generateQuest();
                return q;
            });
        }

        return nextQuests;
    });

    if (questCompleted) {
        playSound('success');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        toast.success("Quest Completed!", { description: `+${xpGained} XP | +${coinsGained} Coins` });
        
        // Grant Rewards
        setUser(u => {
            const newXp = u.xp + xpGained;
            const leveledUp = newXp >= u.xpToNextLevel;
            
            if (leveledUp) {
                setTimeout(() => {
                    playSound('success');
                    confetti({ particleCount: 200, spread: 120, startVelocity: 45 });
                    toast("LEVEL UP!", { description: `You reached level ${u.level + 1}!`, className: 'bg-accent-gold text-black font-bold' });
                }, 800);
            }

            return {
                ...u,
                coins: u.coins + coinsGained,
                xp: leveledUp ? newXp - u.xpToNextLevel : newXp,
                level: leveledUp ? u.level + 1 : u.level,
                xpToNextLevel: leveledUp ? Math.floor(u.xpToNextLevel * 1.5) : u.xpToNextLevel,
            }
        });
    }
  };

  // --- Actions ---

  const resetApp = () => {
    if (confirm("Are you sure you want to delete EVERYTHING? This cannot be undone.")) {
        localStorage.clear();
        setUser(INITIAL_USER);
        setHabits(MOCK_HABITS);
        setQuests(DAILY_QUESTS);
        setMoodLog([]);
        setBadges([]);
        toast.error("All data has been wiped.", { description: "Starting fresh!" });
        // Force reload to clear React state if needed, or just let state update handle it
        setTimeout(() => window.location.reload(), 500);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('hf_theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const toggleHabit = useCallback((id: string) => {
    playSound('click');
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompleting = !h.completedToday;
        
        if (isCompleting) {
          playSound('success');
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, disableForReducedMotion: true });
          
          // Update Quests
          updateQuests('habit');

          setUser(u => {
            const newXp = u.xp + 10;
            const leveledUp = newXp >= u.xpToNextLevel;
            if (leveledUp) {
               setTimeout(() => {
                   playSound('success');
                   confetti({ particleCount: 150, spread: 100 });
                   toast("LEVEL UP!", { description: `You reached level ${u.level + 1}!`, className: 'bg-accent-gold text-black font-bold' });
               }, 500);
            }
            return {
                ...u,
                xp: leveledUp ? newXp - u.xpToNextLevel : newXp,
                level: leveledUp ? u.level + 1 : u.level,
                xpToNextLevel: leveledUp ? Math.floor(u.xpToNextLevel * 1.5) : u.xpToNextLevel,
                coins: u.coins + 5
            };
          });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const newHistory = { ...h.history, [todayStr]: isCompleting };
        const newStreak = isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1);

        return {
          ...h,
          completedToday: isCompleting,
          streak: newStreak,
          history: newHistory,
          lastCompletedDate: isCompleting ? todayStr : h.lastCompletedDate
        };
      }
      return h;
    }));
  }, [user.level]);

  const addHabit = (habitData: Partial<Habit>) => {
    const newHabit: Habit = {
      id: `h${Date.now()}`,
      name: habitData.name || 'New Habit',
      description: habitData.description || '',
      category: habitData.category || 'Health',
      frequency: habitData.frequency || 'daily',
      target: habitData.target || 1,
      unit: habitData.unit || 'times',
      streak: 0,
      completedToday: false,
      history: {},
      order: habits.length,
      specificDays: habitData.specificDays
    };
    setHabits(prev => [...prev, newHabit]);
    toast.success('Habit created');
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    toast('Habit deleted', { icon: '🗑️' });
  };

  const reorderHabits = (newOrder: Habit[]) => {
    setHabits(newOrder.map((h, idx) => ({ ...h, order: idx })));
  };

  const logMood = (rating: number) => {
    const today = new Date().toISOString().split('T')[0];
    setMoodLog(prev => [...prev.filter(m => m.date !== today), { date: today, rating }]);
    setUser(u => ({ ...u, xp: u.xp + 5 }));
    updateQuests('mood');
    toast.success('Mood logged!', { description: "+5 XP" });
  };

  const buyItem = (item: ShopItem) => {
    if (user.coins >= item.cost) {
      setUser(u => ({ ...u, coins: u.coins - item.cost }));
      toast.success(`Purchased ${item.name}!`);
      playSound('success');
    } else {
      toast.error("Not enough coins!");
    }
  };

  return (
    <HabitContext.Provider value={{
      user, habits, quests, badges, moodLog,
      toggleHabit, addHabit, deleteHabit, reorderHabits, logMood, buyItem, toggleTheme, isDarkMode,
      currentView, setCurrentView, resetApp
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error("useHabit must be used within HabitProvider");
  return context;
};