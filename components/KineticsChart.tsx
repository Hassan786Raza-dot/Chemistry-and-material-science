import React from 'react';
import Plot from 'react-plotly.js';
import type { KineticPoint } from '../types';

export default function KineticsChart({ data }: { data: KineticPoint[] }) {
  const traces = [
    { x: data.map((p) => p.time), y: data.map((p) => p.conversion.overall), name: 'Overall conversion (%)', type: 'scatter' as const, mode: 'lines+markers', line: { color: '#22d3ee', width: 3 } },
    { x: data.map((p) => p.time), y: data.map((p) => p.molecularWeightMn), name: 'Mn (g/mol)', type: 'scatter' as const, mode: 'lines+markers', yaxis: 'y2', line: { color: '#a3e635', width: 2 } },
    { x: data.map((p) => p.time), y: data.map((p) => p.dispersity), name: 'Dispersity (Đ)', type: 'scatter' as const, mode: 'lines+markers', yaxis: 'y3', line: { color: '#fbbf24', width: 2, dash: 'dot' } },
  ];
  return <Plot data={traces} layout={{ autosize: true, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: '#cbd5e1' }, margin: { l: 60, r: 90, t: 20, b: 50 }, xaxis: { title: { text: 'Time (min)' }, gridcolor: '#334155' }, yaxis: { title: { text: 'Conversion (%)' }, range: [0, 105], gridcolor: '#334155' }, yaxis2: { title: { text: 'Mn (g/mol)' }, overlaying: 'y', side: 'right', showgrid: false }, yaxis3: { title: { text: 'Đ' }, overlaying: 'y', side: 'right', position: 1.08, range: [1, 2.5], showgrid: false }, legend: { orientation: 'h', y: 1.12 }, hovermode: 'x unified' }} config={{ responsive: true, displaylogo: false }} style={{ width: '100%', height: '100%' }} useResizeHandler />;
}
