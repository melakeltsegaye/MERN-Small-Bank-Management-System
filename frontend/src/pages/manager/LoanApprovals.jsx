import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLoans, approveLoan, rejectLoan, disburseLoan } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const LoanApprovals = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["loans", "for-approval"], queryFn: () => getLoans({}) });
  const [busyId, setBusyId] = useState(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["loans", "for-approval"] });

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await approveLoan(id);
      invalidate();
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await rejectLoan(id, "Rejected by manager");
      invalidate();
    } finally {
      setBusyId(null);
    }
  };

  const handleDisburse = async (id) => {
    setBusyId(id);
    try {
      await disburseLoan(id);
      invalidate();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Underwriting" title="Loan approvals" description="Final sign-off and disbursement." />

      {isLoading ? (
        <Loader label="Fetching loans" />
      ) : (
        <div className="space-y-4">
          {data?.loans?.map((loan) => (
            <div key={loan._id} className="ledger-card p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-parchment-500">{loan.referenceId}</p>
                <p className="font-display font-semibold text-lg capitalize">{loan.loanType} loan — {loan.applicant?.name}</p>
                <p className="text-sm text-parchment-500 mt-1">{fmt(loan.principal)} · {loan.tenureMonths} months</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={loan.status} />
                {loan.status === "under_review" && (
                  <>
                    <button disabled={busyId === loan._id} onClick={() => handleApprove(loan._id)} className="btn-primary !py-2 !px-3 text-xs">
                      Approve
                    </button>
                    <button disabled={busyId === loan._id} onClick={() => handleReject(loan._id)} className="btn-danger !py-2 !px-3 text-xs">
                      Reject
                    </button>
                  </>
                )}
                {loan.status === "approved" && (
                  <button disabled={busyId === loan._id} onClick={() => handleDisburse(loan._id)} className="btn-secondary !py-2 !px-3 text-xs">
                    Disburse
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanApprovals;
