import React, { useMemo } from 'react';
import { Habit } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { Check } from 'lucide-react';

interface CalendarWidgetProps {
  habits: Habit[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ habits }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Start the calendar on Sunday to match grid
  // Add empty placeholders for days before the 1st
  const startDay = getDay(monthStart);
  const emptyDays = Array.from({ length: startDay });

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let totalScheduled = 0;
    let totalCompleted = 0;

    habits.forEach(h => {
        const isScheduled = h.frequency === 'daily' || (h.frequency === 'specific_days' && h.specificDays?.includes(getDay(date)));
        if (isScheduled) {
            totalScheduled++;
            if (h.history && h.history[dateStr]) {
                totalCompleted++;
            }
        }
    });

    if (totalScheduled === 0) return 'none';
    const ratio = totalCompleted / totalScheduled;
    if (ratio === 1) return 'full';
    if (ratio > 0) return 'partial';
    return 'missed';
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">{format(today, 'MMMM yyyy')}</h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg"> Monthly Overview</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        {daysInMonth.map(day => {
            const status = getDayStatus(day);
            const isToday = isSameDay(day, today);
            
            let bgClass = 'bg-slate-50 dark:bg-slate-800 text-slate-400';
            if (status === 'full') bgClass = 'bg-brand-500 text-white shadow-sm shadow-brand-200';
            else if (status === 'partial') bgClass = 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400';
            else if (status === 'missed' && day < today) bgClass = 'bg-red-50 dark:bg-red-900/20 text-red-400';

            return (
                <div 
                    key={day.toISOString()} 
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold relative group ${bgClass} ${isToday ? 'ring-2 ring-indigo-500 z-10' : ''}`}
                >
                    {format(day, 'd')}
                    {status === 'full' && <Check className="w-3 h-3 absolute bottom-0.5 right-0.5 opacity-60" />}
                </div>
            );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4 text-[10px] text-slate-400">
         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-brand-500 mr-1"></div> Perfect</div>
         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-brand-100 dark:bg-brand-900/30 mr-1"></div> Partial</div>
         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-50 dark:bg-red-900/20 mr-1"></div> Missed</div>
      </div>
    </div>
  );
};

export default CalendarWidget;