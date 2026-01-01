
import React, { useState, useEffect, useCallback } from 'react';
import { DISEASES, generateHistoricalData } from './constants';
import { DataPoint, DiseaseConfig, ForecastResponse } from './types';
import { getAIForecast } from './services/geminiService';
import DiseaseChart from './components/DiseaseChart';

const App: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseConfig>(DISEASES[0]);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [forecastInfo, setForecastInfo] = useState<{
    explanation: string;
    academicFraming: string;
  } | null>(null);

  const initializeData = useCallback(() => {
    const historical = generateHistoricalData(selectedDisease.id);
    setData(historical);
    setForecastInfo(null);
  }, [selectedDisease]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleRunForecast = async () => {
    setLoading(true);
    try {
      // Get AI forecast
      const response: ForecastResponse = await getAIForecast(
        selectedDisease.name,
        data.filter(d => d.actual !== null),
        selectedDisease.unit
      );

      // Merge forecast into the data timeline
      const newData = [...data];
      response.forecasts.forEach(f => {
        newData.push({
          date: f.date,
          actual: null,
          forecast: f.value,
          ciLower: f.ciLower,
          ciUpper: f.ciUpper
        });
      });

      setData(newData);
      setForecastInfo({
        explanation: response.explanation,
        academicFraming: response.academicFraming
      });
    } catch (error) {
      console.error("Forecast failed:", error);
      alert("Error generating forecast. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">EpiCast MVP</h1>
            <p className="text-xs text-slate-500 font-medium">Epidemiological Forecasting Framework</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            {/* Updated status text to reflect current Gemini model */}
            <p className="text-xs text-slate-400 font-mono">Status: Connected to Gemini 3 Flash</p>
          </div>
          <a href="https://github.com/example/epicast" target="_blank" className="text-slate-400 hover:text-slate-600">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.11.81 2.235 0 1.62-.015 2.925-.015 3.315 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Configurations</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">TARGET DISEASE</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    value={selectedDisease.id}
                    onChange={(e) => {
                      const d = DISEASES.find(x => x.id === e.target.value);
                      if (d) setSelectedDisease(d);
                    }}
                    disabled={loading}
                  >
                    {DISEASES.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">FORECAST HORIZON</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value="4 Weeks" disabled className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm w-full text-slate-400 font-mono" />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleRunForecast}
                    disabled={loading || data.some(d => d.forecast !== null)}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    Generate Forecast
                  </button>
                  <button 
                    onClick={initializeData}
                    className="w-full mt-3 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors"
                  >
                    Reset Simulation Data
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
              <h3 className="text-blue-900 font-bold text-sm mb-2">Model Specifics</h3>
              <p className="text-blue-800 text-xs leading-relaxed mb-3">
                This MVP simulates a <strong>Prophet-based</strong> time series model optimized for seasonal health data. It accounts for seasonality, historical trends, and allows for exogenous covariates like weather.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/60 text-blue-700 px-2 py-1 rounded text-[10px] font-mono border border-blue-200">ARIMA(p,d,q)</span>
                <span className="bg-white/60 text-blue-700 px-2 py-1 rounded text-[10px] font-mono border border-blue-200">95% CI Bootstrap</span>
              </div>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedDisease.name} Surveillance</h2>
                  <p className="text-slate-500 text-sm mt-1">{selectedDisease.description}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Trend</p>
                    <p className="text-lg font-mono font-bold text-slate-900">
                      {/* Fixed: Use slice().reverse().find() as a compatible alternative to findLastIndex */}
                      {data.slice().reverse().find(d => d.actual !== null)?.actual} <span className="text-xs font-normal text-slate-400">{selectedDisease.unit}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                <DiseaseChart 
                  data={data} 
                  color={selectedDisease.color} 
                  unit={selectedDisease.unit} 
                />
              </div>

              {forecastInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-slate-100 pt-8 animate-fadeIn">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.674a1 1 0 00.922-.617l2.108-4.742A1 1 0 0016.445 10H15.39a1 1 0 01-1-1V7a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1H8.39a1 1 0 00-.948.641l-2.108 4.742a1 1 0 00.922.617z" />
                      </svg>
                      <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Model Insights</h3>
                    </div>
                    <div className="prose prose-sm text-slate-600 leading-relaxed max-w-none">
                      <p>{forecastInfo.explanation}</p>
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mt-4 italic text-amber-800 text-[11px]">
                        <strong>Environmental Driver:</strong> {selectedDisease.weatherFactor}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Academic Framing</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        {forecastInfo.academicFraming}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-bold">Awaiting Forecast Calculation</h3>
                  <p className="text-slate-400 text-sm max-w-xs mt-1">Configure parameters and run the AI model to generate predicted case counts for the next month.</p>
                </div>
              )}
            </div>

            {/* Decision Support Section */}
            <div className="bg-slate-900 rounded-xl p-8 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Future Extension: Decision Support System
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white/10 p-4 rounded-lg border border-white/5">
                  <h4 className="text-blue-400 font-bold mb-2">Automated Resource Routing</h4>
                  <p className="text-slate-300">Integrate hospital bed capacity and PPE stock levels to preemptively reallocate resources to predicted hotspots.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg border border-white/5">
                  <h4 className="text-blue-400 font-bold mb-2">Mobile Early Warning</h4>
                  <p className="text-slate-300">Push-notifications to community leaders when 95% CI upper bounds exceed localized outbreak thresholds.</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg border border-white/5">
                  <h4 className="text-blue-400 font-bold mb-2">Hyper-Local Weather API</h4>
                  <p className="text-slate-300">Replace generic weather factors with real-time satellite precipitation data (TRMM) for precise dengue risk mapping.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 px-6 text-center">
        <p className="text-slate-400 text-[10px] font-medium tracking-widest uppercase">
          EpiCast Framework • Built for Biomedical Informatics Portfolio • 2024
        </p>
      </footer>
    </div>
  );
};

export default App;
