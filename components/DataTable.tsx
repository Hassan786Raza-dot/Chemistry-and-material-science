import React from 'react';
import type { KineticPoint } from '../types';

export default function DataTable({ data }: { data: KineticPoint[] }) {
  const monomerKeys = Object.keys(data[0]?.conversion ?? {}).filter((key) => key !== 'overall');
  return <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-800"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-slate-800 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-3 py-3">Time (min)</th>{monomerKeys.map((key) => <th key={key} className="px-3 py-3">{key} (%)</th>)}<th className="px-3 py-3">Overall (%)</th><th className="px-3 py-3">Mn (g/mol)</th><th className="px-3 py-3">Mw (g/mol)</th><th className="px-3 py-3">Đ</th></tr></thead><tbody>{data.map((point) => <tr key={point.time} className="border-t border-slate-800 text-slate-300 hover:bg-slate-800/50"><td className="px-3 py-2">{point.time.toFixed(0)}</td>{monomerKeys.map((key) => <td key={key} className="px-3 py-2">{point.conversion[key].toFixed(2)}</td>)}<td className="px-3 py-2 font-semibold text-cyan-300">{point.conversion.overall.toFixed(2)}</td><td className="px-3 py-2">{point.molecularWeightMn.toFixed(0)}</td><td className="px-3 py-2">{point.molecularWeightMw.toFixed(0)}</td><td className="px-3 py-2">{point.dispersity.toFixed(2)}</td></tr>)}</tbody></table></div>;
}
