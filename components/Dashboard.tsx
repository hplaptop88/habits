import React, { useState, useMemo } from 'react';
import { useHabit } from '../context/HabitContext';
import HabitGrid from './HabitGrid';
import QuestWidget from './QuestWidget';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Smile, Frown, Meh, Sparkles, MessageSquarePlus } from 'lucide-react';
import { getHabitInsights } from '../services/geminiService';
import { AnimatePresence, motion } from 'framer-motion';
import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

interface DashboardProps {
  onAddHabit: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddHabit }) => {
  const { user, habits, quests, badges, moodLog, logMood } = useHabit();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    setInsight(null);
    const result = await getHabitInsights(habits, moodLog);
    setInsight(result);
    setLoadingInsight(false);
  };

  // Calculate Real Weekly Data
  const weeklyData = useMemo(() => {
    const today = new Date();
    // Get last 7 days including today
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayName = format(d, 'EEE');

        // Calculate completion rate for this day
        // Iterate over all habits and check history
        let completed = 0;
        let total = habits.length;

        habits.forEach(h => {
            if (h.history && h.history[dateStr]) {
                completed++;
            }
        });

        const score = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        data.push({
            name: dayName,
            score: score,
            date: dateStr
        });
    }
    return data;
  }, [habits]);

  const averageScore = useMemo(() => {
      const sum = weeklyData.reduce((acc, curr) => acc + curr.score, 0);
      return Math.round(sum / weeklyData.length);
  }, [weeklyData]);

  return (
    <div className="space-y-6 relative">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Graph Card */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Consistency</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Daily completion rate over the last 7 days.</p>
                </div>
                 <div className={`px-3 py-1 rounded-full text-sm font-bold border ${averageScore > 70 ? 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {averageScore}% Avg
                </div>
            </div>
            
            <div className="flex-1 min-h-[160px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" opacity={0.3} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#1e293b' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            formatter={(value: number) => [`${value}%`, 'Completion']}
                        />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis hide domain={[0, 100]} />
                        <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" animationDuration={1000} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* User Level Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-xp/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Current Level</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white">{user.level}</span>
                </div>
                <div className="mb-6">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-accent-xp">{user.xp} XP</span>
                        <span className="text-slate-400">{user.xpToNextLevel} XP</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (user.xp / user.xpToNextLevel) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGetInsight}
                disabled={loadingInsight}
                className="relative z-10 w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-slate-900/20"
            >
                <Sparkles className={`w-4 h-4 mr-2 ${loadingInsight ? 'animate-spin' : ''}`} />
                {loadingInsight ? 'Analyzing...' : 'Get AI Insight'}
            </button>
            
            {insight && (
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-300 animate-in fade-in slide-in-from-bottom-2">
                    {insight}
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Habits */}
        <div className="lg:col-span-2 h-full">
            <HabitGrid onAddHabit={onAddHabit} />
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
            <QuestWidget quests={quests} />
            
            {/* Mood Tracker */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">How do you feel today?</h3>
                <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <button 
                            key={rating} 
                            onClick={() => logMood(rating)}
                            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        >
                            {rating === 1 && <Frown className="w-6 h-6 text-red-400" />}
                            {rating === 2 && <Meh className="w-6 h-6 text-orange-400" />}
                            {rating === 3 && <Meh className="w-6 h-6 text-yellow-400" />}
                            {rating === 4 && <Smile className="w-6 h-6 text-brand-400" />}
                            {rating === 5 && <Smile className="w-6 h-6 text-brand-600 fill-current bg-white dark:bg-slate-900" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Recent Badges</h3>
                    <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">View All</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {badges.map(badge => (
                        <div key={badge.id} className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-xl flex flex-col items-center justify-center p-2 text-center border border-slate-100 dark:border-slate-700 hover:border-brand-200 transition-colors cursor-pointer group relative">
                            <span className="text-2xl mb-1">{badge.icon}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{badge.name}</span>
                        </div>
                    ))}
                    {badges.length < 3 && Array.from({ length: 3 - badges.length }).map((_, i) => (
                        <div key={i} className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-600">
                            ?
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Floating AI Coach Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
            {showAiChat && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="absolute bottom-16 right-0 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 mb-2 origin-bottom-right"
                >
                    <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-2">
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-sm dark:text-white">Habit Coach</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                        I can help you build a routine! Try adding a habit for "Deep Work" to boost your productivity score.
                    </p>
                    <div className="flex space-x-2">
                        <button onClick={() => setShowAiChat(false)} className="flex-1 bg-brand-500 text-white text-xs font-bold py-1.5 rounded-lg">Got it</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        <button 
            onClick={() => setShowAiChat(!showAiChat)}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        >
            <MessageSquarePlus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;