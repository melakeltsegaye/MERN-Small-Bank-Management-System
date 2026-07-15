import React from "react";

const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
    <div>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.2em] text-vault-gold font-mono mb-2">{eyebrow}</p>
      )}
      <h1 className="text-2xl md:text-3xl font-display font-semibold text-parchment-100">{title}</h1>
      {description && <p className="text-parchment-500 mt-1.5 text-sm max-w-xl">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;
