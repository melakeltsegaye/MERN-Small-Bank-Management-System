import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLoans, reviewLoan, rejectLoan } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const LoanQueue = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["loans", "pending"], queryFn: () => getLoans({ status: "pending" }) });
  const [busyId, setBusyId] = useState(null);

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
      ) : data?.loans?.length === 0 ? (
        <div className="card p-8 text-center text-parchment-500">No pending applications.</div>
      ) : (
        <div className="space-y-4">
          {data.loans.map((loan) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanQueue;
