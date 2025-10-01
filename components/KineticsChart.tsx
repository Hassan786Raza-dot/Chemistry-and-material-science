
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { KineticPoint } from '../types';

interface KineticsChartProps {
  data: KineticPoint[];
}

const KineticsChart: React.FC<KineticsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis 
            dataKey="time" 
            name="Time" 
            unit=" min" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#94a3b8' }}
        />
        <YAxis 
            yAxisId="left" 
            stroke="#06b6d4" 
            label={{ value: 'Conversion (%)', angle: -90, position: 'insideLeft', fill: '#06b6d4' }}
            tick={{ fill: '#06b6d4' }}
            tickLine={{ stroke: '#06b6d4' }}
        />
        <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#84cc16" 
            label={{ value: 'Mn (g/mol)', angle: 90, position: 'insideRight', fill: '#84cc16' }}
            tick={{ fill: '#84cc16' }}
            tickLine={{ stroke: '#84cc16' }}
            tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'scientific' }).format(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#475569',
            color: '#cbd5e1'
          }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
        <Line yAxisId="left" type="monotone" dataKey="conversion" name="Conversion" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
        <Line yAxisId="right" type="monotone" dataKey="molecularWeight" name="Molecular Weight" stroke="#84cc16" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default KineticsChart;
