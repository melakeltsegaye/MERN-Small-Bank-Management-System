import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#C9A227", "#2FA57B", "#8FA39D", "#C1443D", "#5B8AA6", "#9C6ADE"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-ink-950 border border-ink-600 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-parchment-100 font-medium capitalize">{name}</p>
      <p className="text-vault-goldLight font-mono">{value}</p>
    </div>
  );
};

const DonutChart = ({ data, height = 220, centerLabel, centerValue }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length || total === 0) {
    return (
      <div className="flex items-center justify-center text-parchment-500 text-sm" style={{ height }}>
        No data yet
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-display font-semibold text-parchment-100 amount-mono">{centerValue}</p>
          <p className="text-[10px] uppercase tracking-wider text-parchment-500 mt-0.5">{centerLabel}</p>
        </div>
      )}
    </div>
  );
};

export const ChartLegend = ({ data }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
    {data.map((entry, i) => (
      <div key={entry.name} className="flex items-center gap-1.5 text-xs text-parchment-300">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
        <span className="capitalize">{entry.name.replace(/_/g, " ")}</span>
        <span className="text-parchment-500 font-mono">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default DonutChart;