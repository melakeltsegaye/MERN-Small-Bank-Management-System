const Alert = ({ type = "error", children }) => {
  if (!children) return null;
  const styles =
    type === "error"
      ? "border-signal-red/40 bg-signal-red/10 text-signal-red"
      : "border-sage/40 bg-sage/10 text-sage-bright";
  return <div className={`rounded-md border px-4 py-3 text-sm ${styles}`}>{children}</div>;
};

export default Alert;
