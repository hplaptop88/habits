import { GoogleGenAI, Type } from "@google/genai";
import { Habit, MoodLog, AnalyticsInsights } from "../types";

// Note: In a production environment, API calls should be proxied through a backend
// to protect the API key. This is a frontend-only demonstration.

const getAiClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be simulated or fail.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getHabitInsights = async (habits: Habit[], moodHistory: MoodLog[]) => {
  const ai = getAiClient();
  
  if (!ai) {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("Based on your patterns, you tend to perform better on 'Learning' tasks in the morning. Try scheduling 'Read Book' before 9 AM to boost your streak consistency! Also, your mood correlates positively with exercise.");
      }, 1500);
    });
  }

  const prompt = `
    Analyze the following habit data and mood history. Provide a short, encouraging, and actionable insight (max 2 sentences) to help the user improve their routine.
    
    Habits: ${JSON.stringify(habits.map(h => ({ name: h.name, streak: h.streak, category: h.category })))}
    Mood History (last 5 days): ${JSON.stringify(moodHistory)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Keep going!";
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "Keep up the great work! Consistency is key to building lasting habits.";
  }
};

export const generateAnalyticsInsights = async (habits: Habit[], moodHistory: MoodLog[]): Promise<AnalyticsInsights> => {
  const ai = getAiClient();

  if (!ai) {
    // Mock response for demo without API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          streakPrediction: "Your 'Read Book' streak is at risk on weekends. Try setting a reminder for Saturday mornings.",
          optimalSchedule: "You are most productive on Tuesdays. Consider moving your 'Gym Workout' to Tuesday mornings.",
          moodCorrelation: "Your mood is 20% higher on days you complete 'Morning Meditation'.",
          generatedAt: Date.now()
        });
      }, 2000);
    });
  }

  const prompt = `
    Analyze the user's habit data and mood logs to provide 3 distinct insights.
    1. streakPrediction: Identify a habit at risk of being broken based on low history or patterns.
    2. optimalSchedule: Suggest a time or day to perform habits based on successful history.
    3. moodCorrelation: Correlate mood ratings with habit categories.
    
    Data:
    Habits: ${JSON.stringify(habits.map(h => ({ name: h.name, streak: h.streak, history: h.history, category: h.category })))}
    Moods: ${JSON.stringify(moodHistory)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            streakPrediction: { type: Type.STRING },
            optimalSchedule: { type: Type.STRING },
            moodCorrelation: { type: Type.STRING },
          },
          required: ['streakPrediction', 'optimalSchedule', 'moodCorrelation']
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    return {
      ...data,
      generatedAt: Date.now()
    };

  } catch (error) {
    console.error("Error generating detailed analytics:", error);
    return {
      streakPrediction: "Unable to analyze streak risks at this time.",
      optimalSchedule: "Keep maintaining your daily routine.",
      moodCorrelation: "Track more mood data to see correlations.",
      generatedAt: Date.now()
    };
  }
};
