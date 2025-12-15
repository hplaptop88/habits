import React, { useState } from 'react';
import { X, Award, Zap, Flame, Star, Crown, Shield, Target } from 'lucide-react';
import { useHabit } from '../context/HabitContext';

interface BadgeDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS = [
    { id: 'award', icon: <Award /> },
    { id: 'star', icon: <Star /> },
    { id: 'flame', icon: <Flame /> },
    { id: 'crown', icon: <Crown /> },
    { id: 'zap', icon: <Zap /> },
    { id: 'shield', icon: <Shield /> },
    { id: 'target', icon: <Target /> },
];

const BadgeDesignerModal: React.FC<BadgeDesignerModalProps> = ({ isOpen, onClose }) => {
  const { createCustomBadge } = useHabit();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('award');
  const [type, setType] = useState<'streak' | 'xp' | 'habit_count'>('streak');
  const [value, setValue] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomBadge({
        name,
        description,
        icon: ICONS.find(i => i.id === selectedIcon)?.id || 'award', // simplified string for now, technically we'd need better icon storage
        criteriaType: type,
        criteriaValue: value
    });
    onClose();
    setName('');
    setDescription('');
    setValue(10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
               <Award className="w-5 h-5 mr-2 text-brand-500" />
               Badge Designer
           </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            {/* Preview */}
            <div className="flex justify-center mb-6">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white shadow-inner mb-2 border border-slate-200 dark:border-slate-700">
                        {React.cloneElement(ICONS.find(i => i.id === selectedIcon)?.icon as React.ReactElement<any>, { className: 'w-10 h-10' })}
                    </div>
                    <div className="font-bold text-lg text-slate-800 dark:text-white">{name || "Badge Name"}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto">{description || "Badge description preview"}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Details</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Badge Name"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white mb-3 text-sm"
                        required
                    />
                     <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm"
                    />
                </div>
                <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Icon</label>
                     <div className="grid grid-cols-4 gap-2">
                        {ICONS.map(i => (
                            <button
                                key={i.id}
                                type="button"
                                onClick={() => setSelectedIcon(i.id)}
                                className={`p-2 rounded-lg flex items-center justify-center border transition-all
                                    ${selectedIcon === i.id 
                                        ? 'bg-brand-500 text-white border-brand-500' 
                                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                            >
                                {React.cloneElement(i.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                            </button>
                        ))}
                     </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Unlock Criteria</label>
                <div className="flex gap-2 mb-3">
                    {['streak', 'xp', 'habit_count'].map(t => (
                        <button
                             key={t}
                             type="button"
                             onClick={() => setType(t as any)}
                             className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wide border transition-all
                                ${type === t 
                                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border-brand-500 ring-1 ring-brand-500' 
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}
                        >
                            {t.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Target Value:</span>
                    <input 
                        type="number" 
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white font-mono"
                        min="1"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    {type === 'streak' && `Badge unlocks when any habit reaches a streak of ${value}.`}
                    {type === 'xp' && `Badge unlocks when you accumulate ${value} total XP.`}
                    {type === 'habit_count' && `Badge unlocks after completing ${value} total habits.`}
                </p>
            </div>
            
            <button 
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center"
            >
                <Award className="w-5 h-5 mr-2" /> Create Badge
            </button>
        </form>
      </div>
    </div>
  );
};

export default BadgeDesignerModal;