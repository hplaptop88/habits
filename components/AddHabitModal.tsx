import React, { useState, useEffect } from 'react';
import { X, Check, Calendar } from 'lucide-react';
import { CATEGORY_ICONS } from '../constants';
import { Habit } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: any) => void;
  initialHabit?: Habit | null;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onSave, initialHabit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri

  useEffect(() => {
    if (initialHabit) {
        setName(initialHabit.name);
        setDescription(initialHabit.description || '');
        setCategory(initialHabit.category);
        setFrequency(initialHabit.frequency === 'weekly' ? 'daily' : initialHabit.frequency as any);
        if (initialHabit.specificDays) setSpecificDays(initialHabit.specificDays);
    } else {
        resetForm();
    }
  }, [initialHabit, isOpen]);

  const resetForm = () => {
      setName('');
      setDescription('');
      setCategory('Health');
      setFrequency('daily');
      setSpecificDays([1, 2, 3, 4, 5]);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
        name, 
        description, 
        category, 
        frequency, 
        specificDays: frequency === 'specific_days' ? specificDays : undefined,
        target: 1, 
        unit: 'count' 
    });
    onClose();
    resetForm();
  };

  const toggleDay = (dayIndex: number) => {
      setSpecificDays(prev => 
        prev.includes(dayIndex) 
            ? prev.filter(d => d !== dayIndex)
            : [...prev, dayIndex].sort()
      );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white">
               {initialHabit ? 'Edit Habit' : 'Create New Habit'}
           </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Habit Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning Run"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:text-white"
                    autoFocus
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 30 minutes in the park"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:text-white text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.keys(CATEGORY_ICONS).map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                                ${category === cat 
                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 ring-1 ring-brand-500' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {CATEGORY_ICONS[cat]}
                            <span className="text-[10px] mt-1 font-medium">{cat}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-3">
                    <button
                        type="button"
                        onClick={() => setFrequency('daily')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${frequency === 'daily' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500'}`}
                    >
                        Everyday
                    </button>
                    <button
                        type="button"
                        onClick={() => setFrequency('specific_days')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${frequency === 'specific_days' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500'}`}
                    >
                        Specific Days
                    </button>
                </div>

                {frequency === 'specific_days' && (
                    <div className="flex justify-between gap-1">
                        {weekDays.map((day, idx) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(idx)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border
                                    ${specificDays.includes(idx)
                                        ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-200 dark:shadow-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}
                            >
                                {day.charAt(0)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </form>

        <div className="p-6 pt-2 flex-shrink-0">
             <button 
                onClick={handleSubmit}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center"
            >
                <Check className="w-5 h-5 mr-2" /> {initialHabit ? 'Save Changes' : 'Create Habit'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;