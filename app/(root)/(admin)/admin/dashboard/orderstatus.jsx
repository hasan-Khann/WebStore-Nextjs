"use client";

import { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Loader2, Package, ArrowUpRight } from "lucide-react";

const STATUS_COLORS = {
  pending: "#6366f1",    // Indigo
  processing: "#06b6d4", // Cyan
  shipped: "#f59e0b",    // Amber
  delivered: "#10b981",  // Emerald
  cancelled: "#ef4444",  // Rose
};

export function OrderStatus({ distribution, loading }) {
  const chartData = useMemo(() => {
    if (!distribution) return [];
    return Object.keys(distribution).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: distribution[key],
      color: STATUS_COLORS[key] || "#94a3b8",
    }));
  }, [distribution]);

  const total = useMemo(() => 
    chartData.reduce((acc, curr) => acc + curr.value, 0), 
  [chartData]);

  return (
    <div className="flex flex-col w-full h-full p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm transition-all hover:shadow-md">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-inner">
            <Package size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">Orders</h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Status Mix</p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowUpRight size={20} className="text-zinc-400" />
        </button>
      </div>

      {/* Chart Area */}
      <div className="relative w-full h-[260px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-zinc-300" />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  innerRadius="75%" 
                  outerRadius="100%" 
                  paddingAngle={10} 
                  dataKey="value" 
                  strokeWidth={0}
                  animationBegin={0}
                  animationDuration={1500}
                  className="focus:outline-none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="hover:opacity-80 transition-opacity cursor-pointer outline-none" 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload?.[0]) {
                      return (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-2xl shadow-2xl">
                          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{payload[0].name}</p>
                          <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">{payload[0].value} <span className="text-xs font-medium text-zinc-400">units</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-1">
              <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">{total}</span>
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Total</span>
            </div>
          </>
        )}
      </div>
      
      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-4 mt-10">
        {chartData.map((item) => (
          <div key={item.name} className="flex flex-col gap-2 p-4 rounded-3xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/30 group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {item.name}
              </span>
            </div>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}