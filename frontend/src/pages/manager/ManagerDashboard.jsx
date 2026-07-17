import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Landmark, ClipboardCheck, ShieldCheck } from "lucide-react";
import { getAccounts } from "../../api/accountApi";
import { getLoans } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import DonutChart, { ChartLegend } from "../../components/charts/DonutChart";
import BarTrend from "../../components/charts/BarTrend";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const ManagerDashboard = () => {
  const { data: accountsData, isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts", "branch-overview"],
    queryFn: () => getAccounts({ limit: 100 }),
  });
  const { data: loansData, isLoading: loadingLoans } = useQuery({
    queryKey: ["loans", "manager-overview"],
    queryFn: () => getLoans({}),
  });

  const accounts = accountsData?.accounts || [];
  const loans = loansData?.loans || [];
  const totalDeposits = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const accountTypeSplit = useMemo(() => {
    const counts = {};
    accounts.forEach((a) => (counts[a.accountType] = (counts[a.accountType] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  const loanStatusSplit = useMemo(() => {
    const counts = {};
    loans.forEach((l) => (counts[l.status] = (counts[l.status] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [loans]);

  const isLoading = loadingAccounts || loadingLoans;

  return (
    <div>
      <PageHeader eyebrow="Branch" title="Manager overview" description="Branch-level activity and pending approvals." />

      {isLoading ? (
        <Loader label="Fetching branch data" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total on deposit" value={fmt(totalDeposits)} sub={`${accountsData?.total || 0} accounts`} icon={Landmark} />
            <StatCard
              label="Awaiting final approval"
              value={loans.filter((l) => l.status === "under_review").length}
              accent="emerald"
              icon={ClipboardCheck}
            />
            <StatCard
              label="Active accounts"
              value={accounts.filter((a) => a.status === "active").length}
              accent="emerald"
              icon={ShieldCheck}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Accounts by type</h3>
              <DonutChart data={accountTypeSplit} centerLabel="Accounts" centerValue={accounts.length} />
              <ChartLegend data={accountTypeSplit} />
            </div>
            <div className="card p-5">
              <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Loan pipeline</h3>
              <BarTrend data={loanStatusSplit} name="Loans" color="#2FA57B" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;