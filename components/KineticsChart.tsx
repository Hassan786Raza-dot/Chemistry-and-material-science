
import React from 'react';
import Plot from 'react-plotly.js';
import type { KineticPoint } from '../types';
import type { Layout, Config } from 'plotly.js';

interface KineticsChartProps {
  data: KineticPoint[];
}

const LINE_COLORS = ['#f97316', '#a855f7', '#ec4899', '#ef4444', '#f59e0b'];

const KineticsChart: React.FC<KineticsChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const monomerKeys = Object.keys(data[0].conversion).filter(key => key !== 'overall');
  const timeData = data.map(p => p.time);

  const traces: any[] = [];

  // Overall Conversion Trace
  traces.push({
    x: timeData,
    y: data.map(p => p.conversion.overall),
    name: 'Overall Conversion',
    type: 'scatter',
    mode: 'lines',
    line: { color: '#06b6d4', width: 3 },
    yaxis: 'y1',
    hovertemplate: '%{y:.2f}%<extra></extra>',
  });

  // Individual Monomer Traces
  monomerKeys.forEach((key, index) => {
    traces.push({
      x: timeData,
      y: data.map(p => p.conversion[key]),
      name: `${key} Conversion`,
      type: 'scatter',
      mode: 'lines',
      line: { color: LINE_COLORS[index % LINE_COLORS.length], width: 2 },
      yaxis: 'y1',
      hovertemplate: '%{y:.2f}%<extra></extra>',
    });
  });

  // Molecular Weight (Mn) Trace
  traces.push({
    x: timeData,
    y: data.map(p => p.molecularWeightMn),
    name: 'Mn',
    type: 'scatter',
    mode: 'lines',
    line: { color: '#84cc16', width: 2 },
    yaxis: 'y2',
    hovertemplate: '%{y:,}<extra></extra>',
  });

  // Dispersity (Đ) Trace
  const pdiData = data.map(p => p.molecularWeightMn > 0 ? p.molecularWeightMw / p.molecularWeightMn : 1);
  traces.push({
      x: timeData,
      y: pdiData,
      name: 'Dispersity (Đ)',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#eab308', width: 2, dash: 'dot'},
      yaxis: 'y3',
      hovertemplate: '%{y:.2f}<extra></extra>',
  });
  
  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      color: '#94a3b8',
      family: 'sans-serif',
    },
    xaxis: {
      // FIX: The `title` property for axes in plotly.js layout expects an object, not a string.
      title: { text: 'Time (min)' },
      gridcolor: '#475569',
      linecolor: '#475569',
    },
    yaxis: {
      // FIX: The `titlefont` property is deprecated. Font properties should be nested inside the `title` object.
      title: { text: 'Conversion (%)', font: { color: '#06b6d4' } },
      tickfont: { color: '#06b6d4' },
      gridcolor: '#475569',
      linecolor: '#475569',
    },
    yaxis2: {
      // FIX: The `titlefont` property is deprecated. Font properties should be nested inside the `title` object.
      title: { text: 'Mn (g/mol)', font: { color: '#84cc16' } },
      tickfont: { color: '#84cc16' },
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      linecolor: '#475569',
      tickformat: '.1e'
    },
    yaxis3: {
        // FIX: The `titlefont` property is deprecated. Font properties should be nested inside the `title` object.
        title: { text: 'Dispersity (Đ)', font: { color: '#eab308' } },
        tickfont: { color: '#eab308' },
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        linecolor: '#475569',
        position: 1,
    },
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.02,
      xanchor: 'right',
      x: 1,
    },
    margin: { l: 70, r: 140, b: 50, t: 20, pad: 4 },
    hovermode: 'x unified',
  };

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    // FIX: Corrected typo from 'toggleSpikeLines' to 'toggleSpikelines'.
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'toggleSpikelines'],
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
};

export default KineticsChart;