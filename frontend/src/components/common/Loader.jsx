import React from "react";

const Loader = ({ label = "Loading" }) => (
  <div className="flex items-center justify-center py-16">
    <div className="flex items-center gap-3 text-parchment-500 font-mono text-xs tracking-widest uppercase">
      <span className="w-2 h-2 rounded-full bg-vault-gold animate-pulse" />
      {label}
    </div>
  </div>
);

export default Loader;
