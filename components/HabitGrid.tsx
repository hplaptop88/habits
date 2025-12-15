import React, { memo } from 'react';
import { Habit } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { Flame, Plus, Trash2, GripVertical } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useHabit } from '../context/HabitContext';

// Animated Checkmark Component
const AnimatedCheckmark = ({ isChecked }: { isChecked: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <motion.path
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: isChecked ? 1 : 0,
        opacity: isChecked ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      d="M20 6L9 17l-5-5"
    />
  </svg>
);

// Memoized Individual Habit Item
const HabitItem = memo(({ habit, toggleHabit, deleteHabit }: { habit: Habit, toggleHabit: (id: string) => void, deleteHabit: (id: string) => void }) => {
    return (
        <Reorder.Item 
            value={habit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="group flex flex-col md:flex-row md:items-center p-4 md:px-6 md:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 transition-colors backdrop-blur-sm first:rounded-t-xl"
        >
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-3">
            <div className="flex items-center">
                    <GripVertical className="w-5 h-5 text-slate-300 mr-2" />
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{habit.name}</h3>
                        <div className="flex items-center text-xs text-slate-500 mt-0.5">
                        {CATEGORY_ICONS[habit.category]} 
                        <span className="ml-1.5">{habit.category}</span>
                    </div>
                </div>
            </div>
                <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full border border-orange-100 dark:border-orange-800">
                <Flame className="w-3 h-3 text-orange-500 mr-1" />
                <span className="font-bold text-orange-600 dark:text-orange-400 text-xs">{habit.streak}</span>
            </div>
        </div>

        {/* Drag Handle Desktop */}
        <div className="hidden md:flex w-8 justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
            <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Info Desktop */}
        <div className="flex-1 hidden md:block select-none">
            <div className="flex items-center">
                {CATEGORY_ICONS[habit.category]}
                <span className="ml-3 font-medium text-slate-800 dark:text-slate-200">{habit.name}</span>
            </div>
            <p className="text-xs text-slate-400 pl-8 mt-0.5">{habit.description}</p>
        </div>

            <div className="hidden md:flex w-20 justify-center items-center select-none">
                <div className="flex items-center text-orange-500 font-bold">
                    <Flame className="w-4 h-4 mr-1 fill-current" /> {habit.streak}
                </div>
            </div>

        {/* History & Checkbox */}
        <div className="w-full md:w-64 flex justify-between items-center px-2">
            {Object.values(habit.history || {}).slice(-6).map((completed, i) => (
                <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs transition-all
                        ${completed ? 'bg-brand-200 dark:bg-brand-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}
                >
                    {completed && <AnimatedCheckmark isChecked={true} />}
                </div>
            ))}
            
            {/* Add filler dots if no history */}
                {Array.from({ length: Math.max(0, 6 - Object.keys(habit.history || {}).length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 mx-3"></div>
                ))}

                <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleHabit(habit.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden
                    ${habit.completedToday 
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-200 dark:ring-brand-900' 
                        : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-brand-300'}`}
            >
                <div className={`absolute inset-0 bg-white/20 ${habit.completedToday ? 'animate-ping opacity-0' : 'hidden'}`}></div>
                <AnimatedCheckmark isChecked={habit.completedToday} />
            </motion.button>
        </div>

        {/* Actions */}
        <div className="hidden md:flex w-12 justify-center md:opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => deleteHabit(habit.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete Habit"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        </Reorder.Item>
    );
});

interface HabitGridProps {
  onAddHabit: () => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({ onAddHabit }) => {
  const { habits, toggleHabit, deleteHabit, reorderHabits } = useHabit();
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Handle reorder
  const handleReorder = (newOrder: Habit[]) => {
      reorderHabits(newOrder);
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full ring-1 ring-slate-900/5">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Habits</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
           <span className="flex items-center"><Flame className="w-3 h-3 text-orange-500 mr-1" /> Streak</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center px-6 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="w-8"></div>
            <div className="flex-1">Habit Name</div>
            <div className="w-20 text-center">Streak</div>
            <div className="w-64 flex justify-between px-2">
                {weekDays.map((d, i) => (
                    <span key={i} className="w-8 text-center">{d}</span>
                ))}
            </div>
            <div className="w-12 text-center">Act</div>
        </div>

        <Reorder.Group axis="y" values={habits} onReorder={handleReorder} className="space-y-0">
          <AnimatePresence initial={false}>
            {habits.map((habit) => (
                <HabitItem key={habit.id} habit={habit} toggleHabit={toggleHabit} deleteHabit={deleteHabit} />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {habits.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-slate-300" />
                </div>
                <p>No habits yet. Start by creating one!</p>
             </div>
        )}

        <button 
            onClick={onAddHabit}
            className="w-full py-4 flex items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors border-t border-dashed border-slate-200 dark:border-slate-800 active:bg-slate-100"
        >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-medium">Add a new habit...</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(HabitGrid);