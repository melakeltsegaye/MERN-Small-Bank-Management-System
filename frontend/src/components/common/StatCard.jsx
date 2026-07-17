import React from "react";

const StatCard = ({ label, value, sub, accent = "gold", icon: Icon }) => {
  const accentClass = accent === "gold" ? "text-vault-goldLight" : accent === "emerald" ? "text-vault-emeraldLight" : "text-red-300";
  const glowClass = accent === "gold" ? "bg-vault-gold/10" : accent === "emerald" ? "bg-vault-emerald/10" : "bg-vault-alert/10";

  return (
    <div className="ledger-card p-5 relative overflow-hidden group hover:border-ink-500 transition-colors duration-200">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${glowClass} blur-2xl group-hover:scale-125 transition-transform duration-500`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-parchment-500 font-medium mb-2">{label}</p>
          <p className={`text-3xl font-display font-semibold ${accentClass} amount-mono`}>{value}</p>
          {sub && <p className="text-xs text-parchment-500 mt-1.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${glowClass} flex items-center justify-center shrink-0`}>
            <Icon size={18} className={accentClass} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;