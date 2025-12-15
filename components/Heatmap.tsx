import React, { useMemo } from 'react';

const Heatmap: React.FC = () => {
  // Generate mock data for the year - Memoized to prevent recalculation on every render
  const data = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (364 - i));
        // Random intensity 0-4
        arr.push({
            date: d,
            level: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0
        });
    }
    return arr;
  }, []); // Empty dependency array means this runs once on mount

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
        <div className="overflow-x-auto pb-2">
            <div className="min-w-[800px] flex gap-1">
                {/* 52 Weeks roughly */}
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                             const dataIndex = weekIndex * 7 + dayIndex;
                             const item = data[dataIndex] || { level: 0 };
                             return (
                                <div 
                                    key={dayIndex} 
                                    className={`w-3 h-3 rounded-sm ${getColor(item.level)} hover:ring-2 hover:ring-slate-300 transition-all`}
                                    title={item.date ? item.date.toDateString() : ''}
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