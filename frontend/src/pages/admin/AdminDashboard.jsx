import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users2, Landmark, ClipboardList, ShieldCheck } from "lucide-react";
import { getUsers } from "../../api/userApi";
import { getAccounts } from "../../api/accountApi";
import { getLoans } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import DonutChart, { ChartLegend } from "../../components/charts/DonutChart";
import BarTrend from "../../components/charts/BarTrend";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const AdminDashboard = () => {
  const { data: users, isLoading: l1 } = useQuery({ queryKey: ["users", "all"], queryFn: () => getUsers({ limit: 200 }) });
  const { data: accounts, isLoading: l2 } = useQuery({ queryKey: ["accounts", "admin-overview"], queryFn: () => getAccounts({ limit: 200 }) });
  const { data: loans, isLoading: l3 } = useQuery({ queryKey: ["loans", "admin-overview"], queryFn: () => getLoans({}) });

  const isLoading = l1 || l2 || l3;
  const userList = users?.users || [];
  const accountList = accounts?.accounts || [];
  const loanList = loans?.loans || [];

  const staffCount = userList.filter((u) => u.role !== "customer").length;
  const totalDeposits = accountList.reduce((s, a) => s + (a.balance || 0), 0);

  const roleSplit = useMemo(() => {
    const counts = {};
    userList.forEach((u) => (counts[u.role] = (counts[u.role] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [userList]);

  const loanStatusSplit = useMemo(() => {
    const counts = {};
    loanList.forEach((l) => (counts[l.status] = (counts[l.status] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [loanList]);

  return (
    <div>
      <PageHeader eyebrow="System" title="Admin overview" description="Institution-wide activity at a glance." />

      {isLoading ? (
        <Loader label="Fetching system data" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total users" value={users?.total || 0} icon={Users2} />
            <StatCard label="Staff members" value={staffCount} accent="emerald" icon={ShieldCheck} />
            <StatCard label="Deposits on file" value={fmt(totalDeposits)} accent="emerald" icon={Landmark} />
            <StatCard label="Loans on file" value={loans?.total || 0} icon={ClipboardList} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Users by role</h3>
              <DonutChart data={roleSplit} centerLabel="Users" centerValue={users?.total || 0} />
              <ChartLegend data={roleSplit} />
            </div>
            <div className="card p-5">
              <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Loans by status</h3>
              <BarTrend data={loanStatusSplit} name="Loans" color="#C9A227" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;