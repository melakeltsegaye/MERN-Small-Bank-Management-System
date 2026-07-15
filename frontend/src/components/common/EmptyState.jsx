const EmptyState = ({ title, description }) => {
  return (
    <div className="card p-10 flex flex-col items-center text-center gap-2">
      <div className="w-10 h-10 rounded-full border border-ink-line flex items-center justify-center text-paper-dim font-mono text-lg mb-2">
        —
      </div>
      <h3 className="font-display text-lg text-paper">{title}</h3>
      {description && <p className="text-sm text-paper-dim max-w-sm">{description}</p>}
    </div>
  );
};

export default EmptyState;
