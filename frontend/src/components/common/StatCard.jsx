import React from "react";

const StatCard = ({ label, value, sub, accent = "gold" }) => {
  const accentClass = accent === "gold" ? "text-vault-goldLight" : "text-vault-emeraldLight";
  return (
    <div className="ledger-card p-5">
      <p className="text-xs uppercase tracking-wider text-parchment-500 font-medium mb-2">{label}</p>
      <p className={`text-3xl font-display font-semibold ${accentClass} amount-mono`}>{value}</p>
      {sub && <p className="text-xs text-parchment-500 mt-1">{sub}</p>}
    </div>
  );
};

export default StatCard;
