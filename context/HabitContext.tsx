import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Habit, Quest, Badge, MoodLog, ShopItem, HabitContextType } from '../types';
import { INITIAL_USER, MOCK_HABITS, DAILY_QUESTS, QUEST_TEMPLATES, RECENT_BADGES } from '../constants';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { playSound } from '../services/soundService';
import { format, subDays, differenceInDays, parseISO, isSameDay } from 'date-fns';

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State ---
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);
  const [quests, setQuests] = useState<Quest[]>(DAILY_QUESTS);
  const [badges, setBadges] = useState<Badge[]>(RECENT_BADGES);
  const [moodLog, setMoodLog] = useState<MoodLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');

  // Helper: Get Local Date String (YYYY-MM-DD)
  const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

  // --- Persistence & Initialization ---
  useEffect(() => {
    const storedUser = localStorage.getItem('hf_user');
    const storedHabits = localStorage.getItem('hf_habits');
    const storedMood = localStorage.getItem('hf_mood');
    const storedQuests = localStorage.getItem('hf_quests');
    const storedTheme = localStorage.getItem('hf_theme');

    let currentHabits = MOCK_HABITS;
    let currentUser = INITIAL_USER;

    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
    }
    if (storedHabits) {
        currentHabits = JSON.parse(storedHabits);
        setHabits(currentHabits);
    }
    if (storedMood) setMoodLog(JSON.parse(storedMood));
    if (storedQuests) setQuests(JSON.parse(storedQuests));
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // --- Daily Streak Audit ---
    checkStreaks(currentHabits, currentUser);
  }, []);

  useEffect(() => {
    localStorage.setItem('hf_user', JSON.stringify(user));
    localStorage.setItem('hf_habits', JSON.stringify(habits));
    localStorage.setItem('hf_mood', JSON.stringify(moodLog));
    localStorage.setItem('hf_quests', JSON.stringify(quests));
  }, [user, habits, moodLog, quests]);

  // --- Core Logic: Streak Audit ---
  const checkStreaks = (currentHabits: Habit[], currentUser: User) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterday = subDays(today, 1);
    
    let freezesUsed = 0;
    let habitsUpdated = false;

    const updatedHabits = currentHabits.map(h => {
        // If no history, ignore
        if (!h.lastCompletedDate) return h;
        if (h.streak === 0) return h;

        const lastDate = parseISO(h.lastCompletedDate);
        
        // If completed today, all good
        if (isSameDay(lastDate, today)) {
             return { ...h, completedToday: true };
        }

        // If completed yesterday, streak is safe, reset daily completion
        if (isSameDay(lastDate, yesterday)) {
            return { ...h, completedToday: false };
        }

        // Gap detected (>1 day)
        const diff = differenceInDays(today, lastDate);
        
        if (diff > 1) {
            // Check for Freeze
            if (currentUser.streakFreezes > freezesUsed) {
                freezesUsed++;
                // Freeze consumed, streak maintained (but not incremented), completedToday false
                return { ...h, completedToday: false }; 
            } else {
                // Streak Broken
                habitsUpdated = true;
                return { ...h, streak: 0, completedToday: false };
            }
        }
        
        return { ...h, completedToday: false };
    });

    if (freezesUsed > 0) {
        setUser(u => ({ ...u, streakFreezes: Math.max(0, u.streakFreezes - freezesUsed) }));
        toast.info(`❄️ Used ${freezesUsed} Streak Freeze(s) to save your progress!`);
        setHabits(updatedHabits);
    } else if (habitsUpdated) {
        setHabits(updatedHabits);
        // Only notify if we didn't just initialize the mock data
        if (currentUser.id !== 'u1' || currentHabits.length > 2) {
             toast.warning("Some streaks were lost due to inactivity.");
        }
    } else {
        // Just update the completedToday state if we are entering a new day naturally
        setHabits(updatedHabits);
    }
  };

  // --- Helpers ---
  const generateQuest = useCallback((): Quest => {
    const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
    // RPG Curve: Difficulty increases slower than linear
    const levelMultiplier = 1 + (Math.log(user.level + 1) * 0.5); 
    
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
            // Simple string matching for quest types
            if (type === 'habit' && (q.title.toLowerCase().includes('habit') || q.title.toLowerCase().includes('streak'))) newProgress += amount;
            if (type === 'mood' && q.title.toLowerCase().includes('mood')) newProgress += amount;
            
            if (newProgress >= q.target && !q.completed) {
                questCompleted = true;
                xpGained += q.rewardXp;
                coinsGained += q.rewardCoins;
                return { ...q, progress: q.target, completed: true };
            }
            return { ...q, progress: Math.min(newProgress, q.target) };
        });

        if (questCompleted) {
            // Replace after a short delay in UI (handled by caller side effects usually, but here we replace data immediately)
             return nextQuests.map(q => q.completed ? generateQuest() : q);
        }
        return nextQuests;
    });

    if (questCompleted) {
        playSound('success');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        toast.success("Quest Completed!", { description: `+${xpGained} XP | +${coinsGained} Coins` });
        gainXp(xpGained);
        setUser(u => ({ ...u, coins: u.coins + coinsGained }));
    }
  };

  const gainXp = (amount: number) => {
      setUser(u => {
          const newXp = u.xp + amount;
          if (newXp >= u.xpToNextLevel) {
              // Level Up!
              setTimeout(() => {
                  playSound('success');
                  confetti({ particleCount: 200, spread: 120, startVelocity: 45 });
                  toast("LEVEL UP!", { description: `Welcome to level ${u.level + 1}!`, className: 'bg-accent-gold text-black font-bold' });
              }, 500);

              // Standard RPG Curve: 100 * (level ^ 1.2)
              const nextLevel = u.level + 1;
              const nextReq = Math.floor(100 * Math.pow(nextLevel, 1.2));

              return {
                  ...u,
                  level: nextLevel,
                  xp: newXp - u.xpToNextLevel,
                  xpToNextLevel: nextReq,
                  coins: u.coins + 25 // Level up bonus
              };
          }
          return { ...u, xp: newXp };
      });
  };

  // --- Actions ---

  const resetApp = () => {
    if (window.confirm("Are you sure you want to delete EVERYTHING? This cannot be undone.")) {
        try {
            localStorage.removeItem('hf_user');
            localStorage.removeItem('hf_habits');
            localStorage.removeItem('hf_mood');
            localStorage.removeItem('hf_quests');
            localStorage.removeItem('hf_theme');
            localStorage.clear(); // Nuclear option just in case

            setUser(INITIAL_USER);
            setHabits(MOCK_HABITS);
            setQuests(DAILY_QUESTS);
            setMoodLog([]);
            setBadges([]);
            
            toast.success("All data has been wiped. Restarting...");
            // Force reload to clear any memory states
            setTimeout(() => window.location.reload(), 800);
        } catch (e) {
            console.error("Reset failed", e);
            toast.error("Failed to reset data. Please clear browser cache manually.");
        }
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
        const todayStr = getTodayStr();
        
        if (isCompleting) {
          playSound('success');
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, disableForReducedMotion: true });
          updateQuests('habit');
          gainXp(10);
          setUser(u => ({ ...u, coins: u.coins + 2 })); // Small coin reward for habit
        } else {
             // Undo completion
             setUser(u => ({ ...u, xp: Math.max(0, u.xp - 10) }));
        }

        // Optimistic Streak Logic for UI
        const newStreak = isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1);
        const newHistory = { ...h.history };
        
        if (isCompleting) {
            newHistory[todayStr] = true;
        } else {
            delete newHistory[todayStr];
        }

        return {
          ...h,
          completedToday: isCompleting,
          streak: newStreak,
          history: newHistory,
          lastCompletedDate: isCompleting ? todayStr : h.lastCompletedDate // technically if undoing, we might want to revert to prev date, but simplified for now
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
    const todayStr = getTodayStr();
    // Check if already logged today
    if (moodLog.some(m => m.date === todayStr)) {
        toast.info("You already logged your mood today!");
        return;
    }
    setMoodLog(prev => [...prev, { date: todayStr, rating }]);
    gainXp(5);
    updateQuests('mood');
    toast.success('Mood logged!', { description: "+5 XP" });
  };

  const buyItem = (item: ShopItem) => {
    if (user.coins >= item.cost) {
      setUser(u => {
          const newState = { ...u, coins: u.coins - item.cost };
          
          if (item.type === 'freeze') {
              newState.streakFreezes += 1;
              toast.success("Streak Freeze acquired!", { description: "Auto-protects one missed day." });
          } else if (item.type === 'theme') {
               toast.success("Theme Unlocked!", { description: "(Cosmetic effect applied)" });
          } else {
              toast.success(`${item.name} purchased!`);
          }
          return newState;
      });
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