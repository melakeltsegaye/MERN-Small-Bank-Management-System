import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "../../api/accountApi";
import { getLoans } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const ManagerDashboard = () => {
  const { data: accountsData, isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts", "branch-overview"],
    queryFn: () => getAccounts({ limit: 100 }),
  });
  const { data: loansData, isLoading: loadingLoans } = useQuery({
    queryKey: ["loans", "under_review"],
    queryFn: () => getLoans({ status: "under_review" }),
  });

  const totalDeposits = (accountsData?.accounts || []).reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div>
      <PageHeader eyebrow="Branch" title="Manager overview" description="Branch-level activity and pending approvals." />

      {loadingAccounts || loadingLoans ? (
        <Loader label="Fetching branch data" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total on deposit" value={fmt(totalDeposits)} sub={`${accountsData?.total || 0} accounts`} />
            <StatCard label="Awaiting final approval" value={loansData?.total || 0} accent="emerald" />
            <StatCard label="Active accounts" value={(accountsData?.accounts || []).filter((a) => a.status === "active").length} accent="emerald" />
          </div>
          <p className="text-sm text-parchment-500">
            Use the sidebar to review accounts, approve loans, and manage employees.
          </p>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
