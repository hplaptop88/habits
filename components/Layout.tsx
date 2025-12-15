import React, { useState } from 'react';
import { useHabit } from '../context/HabitContext';
import { LayoutDashboard, BarChart2, Settings, Coins, Flame, Menu, X, ChevronDown, User as UserIcon, LogOut, Sun, Moon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  onOpenShop: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onOpenShop }) => {
  const { user, currentView, setCurrentView, isDarkMode, toggleTheme, resetApp } = useHabit();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Simplified Nav Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Flame className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="ml-3 font-bold text-xl text-slate-900 dark:text-white tracking-tight">Habit Forge</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
               {/* View Switcher Pill */}
               <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center mr-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as any)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentView === item.id 
                          ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  ))}
               </div>

               {/* Stats Pills */}
               <div className="flex items-center space-x-2 mr-4">
                  <div className="px-3 py-1.5 bg-accent-gold/10 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold flex items-center border border-accent-gold/20">
                    <Coins className="w-4 h-4 mr-1.5 fill-current" />
                    {user.coins}
                  </div>
                  <div className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-sm font-bold flex items-center border border-brand-200 dark:border-brand-800">
                    <div className="w-4 h-4 mr-1.5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{user.level}</div>
                    Level
                  </div>
               </div>

               {/* Profile Dropdown */}
               <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 origin-top-right z-50"
                      >
                         <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                         </div>
                         
                         <button onClick={toggleTheme} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center transition-colors">
                            {isDarkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                         </button>
                         <button onClick={() => {onOpenShop(); setIsProfileOpen(false)}} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center transition-colors">
                            <Coins className="w-4 h-4 mr-3 text-accent-gold" /> Item Shop
                         </button>
                         
                         <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                             <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Danger Zone</div>
                             <button 
                                onClick={resetApp}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                             >
                                <Trash2 className="w-4 h-4 mr-3" /> Reset All Data
                             </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
               <div className="flex items-center px-2 py-1 bg-accent-gold/10 rounded-full border border-accent-gold/20">
                  <Coins className="w-4 h-4 text-accent-gold mr-1" />
                  <span className="font-bold text-sm text-amber-700 dark:text-amber-400">{user.coins}</span>
               </div>
               <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Menu"
               >
                  {isMenuOpen ? <X /> : <Menu />}
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Collapsible) */}
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg"
                >
                    <div className="px-4 py-4 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setCurrentView(item.id as any); setIsMenuOpen(false); }}
                                className={`w-full flex items-center p-3 rounded-xl transition-colors active:scale-98 ${
                                    currentView === item.id 
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </button>
                        ))}
                        <button onClick={onOpenShop} className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98">
                            <Coins className="w-5 h-5 mr-3 text-accent-gold" /> Item Shop
                        </button>
                        <button onClick={toggleTheme} className="w-full flex items-center p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98">
                            {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>

                         <button onClick={resetApp} className="w-full flex items-center p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-98 mt-4 border border-red-100 dark:border-red-900/30">
                            <Trash2 className="w-5 h-5 mr-3" /> Reset App Data
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default React.memo(Layout);
