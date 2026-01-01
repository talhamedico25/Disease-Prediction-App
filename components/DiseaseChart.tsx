
import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { DataPoint } from '../types';

interface Props {
  data: DataPoint[];
  color: string;
  unit: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded shadow-lg text-sm">
        <p className="font-bold mb-1 text-slate-700">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: <span className="font-mono font-semibold">{Math.round(entry.value)}</span>
          </p>
        ))}
        {payload[0]?.payload.ciLower && (
          <p className="text-slate-400 text-xs mt-1 italic">
            95% CI: [{Math.round(payload[0].payload.ciLower)} - {Math.round(payload[0].payload.ciUpper)}]
          </p>
        )}
      </div>
    );
  }
  return null;
};

const DiseaseChart: React.FC<Props> = ({ data, color, unit }) => {
  // Find the split point between actual and forecast without using ES2023 findLastIndex
  const lastActualIndex = data.map(d => d.actual !== null).lastIndexOf(true);
  const splitDate = data[lastActualIndex]?.date;

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }} 
            interval={2} 
            stroke="#94a3b8"
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            stroke="#94a3b8"
            label={{ value: unit, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {/* Confidence Interval Shading */}
          <Area
            name="95% Conf. Interval"
            type="monotone"
            dataKey="ciUpper"
            stroke="none"
            fill={color}
            fillOpacity={0.1}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="ciLower"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            activeDot={false}
          />

          {/* Actual Historical Data */}
          <Line
            name="Actual Cases"
            type="monotone"
            dataKey="actual"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 6 }}
          />

          {/* Forecasted Data */}
          <Line
            name="AI Forecast"
            type="monotone"
            dataKey="forecast"
            stroke={color}
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
          />

          {/* Vertical line splitting actual and forecast */}
          {splitDate && (
            <ReferenceLine x={splitDate} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#94a3b8', fontSize: 10 }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseaseChart;
