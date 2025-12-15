import React, { useMemo } from 'react';
import { Habit } from '../types';
import { subDays, format } from 'date-fns';

interface HeatmapProps {
    habits: Habit[];
}

const Heatmap: React.FC<HeatmapProps> = ({ habits }) => {
  // Generate real data based on habit history
  const data = useMemo(() => {
    const arr = [];
    const today = new Date();
    // 364 days ago to today
    for (let i = 0; i < 365; i++) {
        const d = subDays(today, 364 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        
        let completionCount = 0;
        habits.forEach(h => {
            if (h.history && h.history[dateStr]) {
                completionCount++;
            }
        });

        // Determine intensity level (0-4) based on number of completed habits
        // Level 0: 0, Level 1: 1, Level 2: 2, Level 3: 3-4, Level 4: 5+
        let level = 0;
        if (completionCount === 0) level = 0;
        else if (completionCount === 1) level = 1;
        else if (completionCount === 2) level = 2;
        else if (completionCount <= 4) level = 3;
        else level = 4;

        arr.push({
            date: d,
            level: level,
            count: completionCount
        });
    }
    return arr;
  }, [habits]);

  const getColor = (level: number) => {
    switch(level) {
        case 0: return 'bg-slate-100 dark:bg-slate-800';
        case 1: return 'bg-brand-200 dark:bg-brand-900';
        case 2: return 'bg-brand-300 dark:bg-brand-800';
        case 3: return 'bg-brand-400 dark:bg-brand-600';
        case 4: return 'bg-brand-600 dark:bg-brand-500';
        default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Yearly Consistency</h3>
        <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="min-w-[800px] flex gap-1">
                {/* 52 Weeks roughly */}
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                             const dataIndex = weekIndex * 7 + dayIndex;
                             // Bound check
                             if (dataIndex >= data.length) return null;
                             
                             const item = data[dataIndex];
                             return (
                                <div 
                                    key={dayIndex} 
                                    className={`w-3 h-3 rounded-sm ${getColor(item.level)} hover:ring-2 hover:ring-slate-300 transition-all`}
                                    title={`${item.date.toDateString()}: ${item.count} habits`}
                                />
                             );
                        })}
                    </div>
                ))}
            </div>
        </div>
        <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400 mt-4 space-x-2">
            <span>Less</span>
            <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-3 h-3 rounded-sm bg-brand-200 dark:bg-brand-900"></div>
                <div className="w-3 h-3 rounded-sm bg-brand-400 dark:bg-brand-600"></div>
                <div className="w-3 h-3 rounded-sm bg-brand-600 dark:bg-brand-500"></div>
            </div>
            <span>More</span>
        </div>
    </div>
  );
};

export default React.memo(Heatmap);