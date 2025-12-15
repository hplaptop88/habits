import React, { useState } from 'react';
import { useHabit } from '../context/HabitContext';
import HabitGrid from './HabitGrid';
import QuestWidget from './QuestWidget';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';
import { Smile, Frown, Meh, Sparkles, MessageSquarePlus } from 'lucide-react';
import { getHabitInsights } from '../services/geminiService';
import { AnimatePresence, motion } from 'framer-motion';

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

  // Mock chart data (In real app, derive from habit history)
  const data = [
    { name: 'Mon', score: 60 },
    { name: 'Tue', score: 80 },
    { name: 'Wed', score: 40 },
    { name: 'Thu', score: 100 },
    { name: 'Fri', score: 75 },
    { name: 'Sat', score: 90 },
    { name: 'Sun', score: 85 },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Graph Card */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Performance</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">You're performing 12% better than last week!</p>
                </div>
                 <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full text-sm font-bold border border-brand-100 dark:border-brand-800">
                    85% Avg
                </div>
            </div>
            
            <div className="h-48 w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
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
                            animate={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
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
                    <div className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-600">
                        ?
                    </div>
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
                        I noticed you usually complete "Morning Meditation" on Mondays. Want to set a reminder?
                    </p>
                    <div className="flex space-x-2">
                        <button className="flex-1 bg-brand-500 text-white text-xs font-bold py-1.5 rounded-lg">Yes</button>
                        <button className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold py-1.5 rounded-lg">Dismiss</button>
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
