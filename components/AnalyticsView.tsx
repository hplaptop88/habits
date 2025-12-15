import React, { useEffect, useState } from 'react';
import Heatmap from './Heatmap';
import CalendarWidget from './CalendarWidget';
import { generateAnalyticsInsights } from '../services/geminiService';
import { Habit, MoodLog, AnalyticsInsights } from '../types';
import { BrainCircuit, TrendingUp, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  moodLog: MoodLog[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits, moodLog }) => {
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check cache first (Simulating 'user_insights' table)
    const cached = localStorage.getItem('habit_forge_insights_cache');
    if (cached) {
      const parsed: AnalyticsInsights = JSON.parse(cached);
      // Valid for 24 hours
      if (Date.now() - parsed.generatedAt < 24 * 60 * 60 * 1000) {
        setInsights(parsed);
        return;
      }
    }
    
    // Auto-fetch if no cache or expired
    handleGenerateInsights();
  }, []);

  const handleGenerateInsights = async () => {
    setLoading(true);
    const result = await generateAnalyticsInsights(habits, moodLog);
    setInsights(result);
    localStorage.setItem('habit_forge_insights_cache', JSON.stringify(result));
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <BrainCircuit className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
                AI Performance Coach
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">ML-driven insights based on your recent activity.</p>
          </div>
          <button 
            onClick={handleGenerateInsights}
            disabled={loading}
            className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium flex items-center bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Risk Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-red-100 dark:border-red-900/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center mb-3 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Streak Risk</h3>
                </div>
                {loading ? (
                    <div className="h-16 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                ) : (
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {insights?.streakPrediction || "Analyze your data to see streak risks."}
                    </p>
                )}
            </div>
        </div>

        {/* Optimal Schedule Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center mb-3 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-5 h-5 mr-2" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Optimal Schedule</h3>
                </div>
                 {loading ? (
                    <div className="h-16 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                ) : (
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {insights?.optimalSchedule || "Analyze data to get scheduling tips."}
                    </p>
                )}
            </div>
        </div>

        {/* Mood Correlation Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-purple-100 dark:border-purple-900/20 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center mb-3 text-purple-600 dark:text-purple-400">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Mood Patterns</h3>
                </div>
                 {loading ? (
                    <div className="h-16 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                ) : (
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {insights?.moodCorrelation || "Log your mood to see patterns here."}
                    </p>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <CalendarWidget habits={habits} />
         <Heatmap habits={habits} />
      </div>
    </div>
  );
};

export default AnalyticsView;