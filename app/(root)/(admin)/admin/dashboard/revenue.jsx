"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { Loader2, DollarSign, TrendingUp, ArrowRight } from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const formatCompact = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
  }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xl rounded-2xl ring-4 ring-black/[0.02]">
        <p className="text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
          {formatCurrency(payload[0].value)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Monthly Revenue</span>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data, loading }) {
  const totalRevenue = data?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Top Section: Sub-header with a different background tint to break "plainness" */}
      <div className="p-8 md:p-10 bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 text-indigo-600">
              <DollarSign size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">Revenue</h3>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Store Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Volume</p>
              <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums">
                {formatCompact(totalRevenue)}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
              <TrendingUp size={16} />
              <span>+12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="p-8 md:p-10 pt-12">
        <div className="w-full h-[300px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                {/* Vertical Lines (X-Planes) added here */}
                <CartesianGrid 
                  strokeDasharray="4 4" 
                  vertical={true} 
                  horizontal={true} 
                  stroke="#e2e8f0" 
                  className="dark:stroke-zinc-800/40" 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} 
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }} 
                  content={<CustomTooltip />} 
                />
                {/* Using a second Bar as a "Background/Plane" to fill space */}
                <Bar 
                  dataKey="revenue" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} className="transition-all duration-300 hover:brightness-110" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}