
export interface DataPoint {
  date: string;
  actual: number | null;
  forecast: number | null;
  ciLower: number | null;
  ciUpper: number | null;
  weather?: number; // Simulated rainfall or temperature
}

export interface DiseaseConfig {
  id: string;
  name: string;
  unit: string;
  description: string;
  color: string;
  weatherFactor: string;
}

export interface ForecastResponse {
  forecasts: {
    date: string;
    value: number;
    ciLower: number;
    ciUpper: number;
  }[];
  explanation: string;
  academicFraming: string;
}
