import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { getLoans, reviewLoan, rejectLoan } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import BarTrend from "../../components/charts/BarTrend";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const LoanQueue = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["loans", "pending"], queryFn: () => getLoans({ status: "pending" }) });
  const [busyId, setBusyId] = useState(null);

  const loans = data?.loans || [];

  const byType = useMemo(() => {
    const counts = {};
    loans.forEach((l) => (counts[l.loanType] = (counts[l.loanType] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [loans]);

  const totalRequested = loans.reduce((s, l) => s + (l.principal || 0), 0);

  const handleDecision = async (id, decision) => {
    setBusyId(id);
    try {
      if (decision === "approve") {
        await reviewLoan(id, { decision: "approve", notes: "Recommended for approval" });
      } else {
        await rejectLoan(id, "Did not meet review criteria");
      }
      queryClient.invalidateQueries({ queryKey: ["loans", "pending"] });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Underwriting" title="Loan queue" description="Review pending loan applications." />

      {isLoading ? (
        <Loader label="Fetching applications" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Pending applications" value={loans.length} icon={ClipboardList} />
            <StatCard label="Total requested" value={fmt(totalRequested)} accent="emerald" icon={CheckCircle2} />
            <StatCard label="Loan types in queue" value={byType.length} accent="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {loans.length === 0 ? (
                <div className="card p-8 text-center text-parchment-500">No pending applications.</div>
              ) : (
                loans.map((loan) => (
                  <div key={loan._id} className="ledger-card p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-parchment-500">{loan.referenceId}</p>
                      <p className="font-display font-semibold text-lg capitalize">{loan.loanType} loan — {loan.applicant?.name}</p>
                      <p className="text-sm text-parchment-500 mt-1">
                        {fmt(loan.principal)} over {loan.tenureMonths} months at {loan.interestRate}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={loan.status} />
                      <button
                        disabled={busyId === loan._id}
                        onClick={() => handleDecision(loan._id, "approve")}
                        className="btn-primary !py-2 !px-3 text-xs"
                      >
                        Recommend
                      </button>
                      <button
                        disabled={busyId === loan._id}
                        onClick={() => handleDecision(loan._id, "reject")}
                        className="btn-danger !py-2 !px-3 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Queue by loan type</h3>
              <BarTrend data={byType} name="Applications" height={220} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanQueue;