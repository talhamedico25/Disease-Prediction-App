
import { DiseaseConfig, DataPoint } from './types';

export const DISEASES: DiseaseConfig[] = [
  {
    id: 'dengue',
    name: 'Dengue Fever',
    unit: 'Weekly Cases',
    description: 'Vector-borne tropical disease highly sensitive to seasonal rainfall and temperature.',
    color: '#3b82f6',
    weatherFactor: 'Increased rainfall increases stagnant water, promoting Aedes aegypti breeding sites.'
  },
  {
    id: 'influenza',
    name: 'Influenza (Seasonal)',
    unit: 'Laboratory Confirmed Cases',
    description: 'Respiratory infection with clear winter seasonality in temperate climates.',
    color: '#ef4444',
    weatherFactor: 'Low humidity and cold temperatures favor viral stability and indoor transmission.'
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    unit: 'Confirmed Cases',
    description: 'Ongoing viral pandemic with wave-like patterns driven by variants and social behavior.',
    color: '#10b981',
    weatherFactor: 'Social dynamics and indoor crowding during adverse weather drive peaks.'
  }
];

// Helper to generate realistic historical data
export const generateHistoricalData = (diseaseId: string): DataPoint[] => {
  const points: DataPoint[] = [];
  const now = new Date();
  const weeksToGenerate = 26; // 6 months of historical data
  
  let baseValue = diseaseId === 'dengue' ? 120 : (diseaseId === 'influenza' ? 450 : 2000);
  
  for (let i = weeksToGenerate; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i * 7));
    
    // Add some seasonality and noise
    const seasonality = Math.sin((weeksToGenerate - i) / 4) * (baseValue * 0.4);
    const noise = (Math.random() - 0.5) * (baseValue * 0.2);
    const trend = (weeksToGenerate - i) * (baseValue * 0.02);
    
    const value = Math.max(0, Math.round(baseValue + seasonality + noise + trend));
    
    points.push({
      date: d.toISOString().split('T')[0],
      actual: value,
      forecast: null,
      ciLower: null,
      ciUpper: null,
      weather: Math.round(Math.random() * 100) // Generic rainfall/temp metric
    });
  }
  
  return points;
};
