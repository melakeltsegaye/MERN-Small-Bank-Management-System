import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getAuditLogsApi } from "../../api/auditLogApi.js";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getAuditLogsApi({ limit: 50 });
      setLogs(data.logs);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl mb-8">Audit log</h1>

      {logs.length === 0 ? (
        <EmptyState title="No activity recorded yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <div key={log._id} className="card px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "failure" ? "bg-signal-red" : "bg-sage"}`} />
                <div>
                  <p className="text-sm">
                    <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>{" "}
                    <span className="text-paper-dim">by {log.performedBy?.name || "Unknown"}</span>
                  </p>
                  {log.description && <p className="text-xs text-paper-dim mt-0.5">{log.description}</p>}
                </div>
              </div>
              <span className="text-xs font-mono text-paper-dim whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AuditLogs;
