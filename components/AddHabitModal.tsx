import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { CATEGORY_ICONS } from '../constants';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: any) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Health');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, frequency: 'daily', target: 1, unit: 'count' });
    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Habit</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            <span className="text-xs mt-1 font-medium">{cat}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit"
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center"
                >
                    <Check className="w-5 h-5 mr-2" /> Create Habit
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;