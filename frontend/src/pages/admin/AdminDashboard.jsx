import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../api/userApi";
import { getAccounts } from "../../api/accountApi";
import { getLoans } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";

const AdminDashboard = () => {
  const { data: users, isLoading: l1 } = useQuery({ queryKey: ["users", "all"], queryFn: () => getUsers({ limit: 200 }) });
  const { data: accounts, isLoading: l2 } = useQuery({ queryKey: ["accounts", "admin-overview"], queryFn: () => getAccounts({ limit: 200 }) });
  const { data: loans, isLoading: l3 } = useQuery({ queryKey: ["loans", "admin-overview"], queryFn: () => getLoans({}) });

  const staffCount = (users?.users || []).filter((u) => u.role !== "customer").length;

  return (
    <div>
      <PageHeader eyebrow="System" title="Admin overview" description="Institution-wide activity at a glance." />

      {l1 || l2 || l3 ? (
        <Loader label="Fetching system data" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Total users" value={users?.total || 0} />
          <StatCard label="Staff members" value={staffCount} accent="emerald" />
          <StatCard label="Accounts" value={accounts?.total || 0} accent="emerald" />
          <StatCard label="Loans on file" value={loans?.total || 0} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
