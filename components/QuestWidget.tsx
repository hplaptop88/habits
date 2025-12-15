import React from 'react';
import { Quest } from '../types';
import { Gift, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestWidgetProps {
  quests: Quest[];
}

const QuestWidget: React.FC<QuestWidgetProps> = ({ quests }) => {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">Daily Quests</h3>
        <Gift className="w-5 h-5 text-accent-xp" />
      </div>

      <div className="space-y-6">
        <AnimatePresence>
        {quests.map((quest) => (
          <motion.div 
            key={quest.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-500 mr-3" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 mr-3" />
                )}
                <span className={`text-sm font-medium ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                    {quest.title}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-400">
                {quest.progress}/{quest.target}
              </div>
            </div>
            
            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${quest.completed ? 'bg-brand-500' : 'bg-brand-400'}`}
                />
            </div>
            
            <div className="flex justify-end mt-1.5 space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[10px] font-bold text-accent-xp flex items-center">
                    +{quest.rewardXp} XP
                </span>
                <span className="text-[10px] font-bold text-accent-gold flex items-center">
                    +{quest.rewardCoins} Coins
                </span>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestWidget;