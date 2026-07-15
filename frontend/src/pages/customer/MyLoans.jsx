import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyLoans } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const MyLoans = () => {
  const { data, isLoading } = useQuery({ queryKey: ["my-loans"], queryFn: getMyLoans });

  return (
    <div>
      <PageHeader eyebrow="Credit" title="Your loans" description="Track applications and active loans." />

      {isLoading ? (
        <Loader label="Fetching loans" />
      ) : data?.loans?.length === 0 ? (
        <div className="card p-8 text-center text-parchment-500">No loan applications yet.</div>
      ) : (
        <div className="space-y-4">
          {data.loans.map((loan) => (
            <div key={loan._id} className="ledger-card p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-mono text-xs text-parchment-500">{loan.referenceId}</p>
                  <p className="font-display text-lg font-semibold capitalize mt-1">{loan.loanType} loan</p>
                </div>
                <Badge status={loan.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">Principal</p>
                  <p className="amount-mono text-vault-goldLight">{fmt(loan.principal)}</p>
                </div>
                <div>
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">Tenure</p>
                  <p className="amount-mono">{loan.tenureMonths} mo</p>
                </div>
                <div>
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">EMI</p>
                  <p className="amount-mono">{loan.emiAmount ? fmt(loan.emiAmount) : "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;
