import React, { Suspense, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ShopModal from './components/ShopModal';
import AddHabitModal from './components/AddHabitModal';
import BadgeDesignerModal from './components/BadgeDesignerModal';
import { SHOP_ITEMS } from './constants';
import { Loader2 } from 'lucide-react';
import { HabitProvider, useHabit } from './context/HabitContext';
import { Toaster } from 'sonner';
import { Habit } from './types';

// Lazy load Analytics view
const AnalyticsView = React.lazy(() => import('./components/AnalyticsView'));

// Inner Component to use Context
const AppContent = () => {
    const { user, habits, moodLog, currentView, addHabit, updateHabit, buyItem } = useHabit();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isBadgeDesignerOpen, setIsBadgeDesignerOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const handleSaveHabit = (data: any) => {
        if (editingHabit) {
            updateHabit(editingHabit.id, data);
        } else {
            addHabit(data);
        }
    };

    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsAddHabitOpen(true);
    };

    const handleCloseHabitModal = () => {
        setIsAddHabitOpen(false);
        setEditingHabit(null);
    };

    return (
        <>
            <Layout onOpenShop={() => setIsShopOpen(true)}>
                {currentView === 'dashboard' ? (
                    <Dashboard 
                        onAddHabit={() => setIsAddHabitOpen(true)} 
                        onEditHabit={handleEditHabit}
                        onOpenBadgeDesigner={() => setIsBadgeDesignerOpen(true)}
                    />
                ) : (
                    <Suspense fallback={
                        <div className="flex h-64 items-center justify-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    }>
                        <AnalyticsView habits={habits} moodLog={moodLog} />
                    </Suspense>
                )}
            </Layout>

            <ShopModal 
                isOpen={isShopOpen} 
                onClose={() => setIsShopOpen(false)} 
                items={SHOP_ITEMS}
                userCoins={user.coins}
                onBuy={buyItem} 
            />

            <AddHabitModal 
                isOpen={isAddHabitOpen} 
                onClose={handleCloseHabitModal}
                onSave={handleSaveHabit}
                initialHabit={editingHabit}
            />

            <BadgeDesignerModal
                isOpen={isBadgeDesignerOpen}
                onClose={() => setIsBadgeDesignerOpen(false)}
            />
        </>
    );
};

export default function App() {
  return (
    <HabitProvider>
        <AppContent />
        <Toaster position="bottom-center" richColors theme="system" />
    </HabitProvider>
  );
}