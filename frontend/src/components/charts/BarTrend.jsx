import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink-950 border border-ink-600 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-parchment-100 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-vault-goldLight font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const BarTrend = ({ data, dataKey = "value", xKey = "name", color = "#C9A227", height = 220, name = "Value" }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-parchment-500 text-sm" style={{ height }}>
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1D3230" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: "#8FA39D", fontSize: 11 }} axisLine={{ stroke: "#28403C" }} tickLine={false} />
        <YAxis tick={{ fill: "#8FA39D", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(201,162,39,0.06)" }} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarTrend;