import React from "react";

const STYLES = {
  active: "bg-vault-emerald/15 text-vault-emeraldLight",
  completed: "bg-vault-emerald/15 text-vault-emeraldLight",
  approved: "bg-vault-emerald/15 text-vault-emeraldLight",
  disbursed: "bg-vault-emerald/15 text-vault-emeraldLight",
  paid: "bg-vault-emerald/15 text-vault-emeraldLight",
  pending: "bg-vault-gold/15 text-vault-goldLight",
  under_review: "bg-vault-gold/15 text-vault-goldLight",
  upcoming: "bg-vault-gold/15 text-vault-goldLight",
  frozen: "bg-vault-gold/15 text-vault-goldLight",
  rejected: "bg-vault-alert/15 text-red-300",
  closed: "bg-vault-alert/15 text-red-300",
  defaulted: "bg-vault-alert/15 text-red-300",
  suspended: "bg-vault-alert/15 text-red-300",
  deactivated: "bg-parchment-500/15 text-parchment-500",
};

const Badge = ({ status }) => {
  const cls = STYLES[status] || "bg-parchment-500/15 text-parchment-500";
  return <span className={`badge ${cls} capitalize`}>{status?.replace(/_/g, " ")}</span>;
};

export default Badge;
