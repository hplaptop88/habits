import React from 'react';
import { ShopItem } from '../types';
import { X, Coins } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShopItem[];
  userCoins: number;
  onBuy?: (item: ShopItem) => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, items, userCoins, onBuy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Item Shop</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Spend your hard-earned coins</p>
            </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 flex items-center justify-between border-b border-amber-100 dark:border-amber-900/30">
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">Your Balance</span>
            <div className="flex items-center font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                <Coins className="w-4 h-4 mr-2 fill-current" />
                {userCoins}
            </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
                <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col hover:border-brand-300 dark:hover:border-brand-700 transition-colors group bg-white/50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl bg-slate-50 dark:bg-slate-700 p-2 rounded-xl">{item.icon}</span>
                        <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                            {item.cost} Coins
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{item.description}</p>
                    <button 
                        onClick={() => onBuy && onBuy(item)}
                        disabled={userCoins < item.cost}
                        className={`w-full py-2 rounded-lg font-semibold text-sm transition-all
                            ${userCoins >= item.cost 
                                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-200 dark:shadow-none' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                    >
                        {userCoins >= item.cost ? 'Purchase' : 'Not enough coins'}
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ShopModal;