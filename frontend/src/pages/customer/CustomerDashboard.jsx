import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Send } from "lucide-react";
import { getMyAccounts } from "../../api/accountApi";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import DonutChart, { ChartLegend } from "../../components/charts/DonutChart";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const CustomerDashboard = () => {
  const { data, isLoading } = useQuery({ queryKey: ["my-accounts"], queryFn: getMyAccounts });

  const accounts = data?.accounts || [];
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const balanceDistribution = accounts.map((a) => ({
    name: `${a.accountType.replace("_", " ")} •${a.accountNumber.slice(-4)}`,
    value: Math.round(a.balance * 100) / 100,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Your accounts"
        description="Balances, activity, and quick actions for your accounts."
        action={
          <div className="flex gap-2">
            <Link to="/deposit" className="btn-primary text-sm flex items-center gap-1.5">
              <ArrowDownToLine size={15} /> Deposit
            </Link>
            <Link to="/withdraw" className="btn-secondary text-sm flex items-center gap-1.5">
              <ArrowUpFromLine size={15} /> Withdraw
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <Loader label="Fetching accounts" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total balance" value={fmt(totalBalance)} sub={`${accounts.length} account(s)`} icon={Wallet} />
            <StatCard
              label="Active accounts"
              value={accounts.filter((a) => a.status === "active").length}
              accent="emerald"
              icon={ArrowDownToLine}
            />
            <StatCard label="Currency" value="USD" accent="emerald" icon={Send} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <h2 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-3">Accounts</h2>
              {accounts.length === 0 ? (
                <div className="card p-8 text-center text-parchment-500">
                  No accounts yet. Visit a branch or contact an employee to open one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {accounts.map((acc) => (
                    <div key={acc._id} className="ledger-card p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-parchment-500 font-medium mb-1">
                            {acc.accountType.replace("_", " ")}
                          </p>
                          <p className="font-mono text-sm text-parchment-300">•••• {acc.accountNumber.slice(-4)}</p>
                        </div>
                        <Badge status={acc.status} />
                      </div>
                      <p className="text-2xl font-display font-semibold amount-mono text-vault-goldLight">
                        {fmt(acc.balance)}
                      </p>
                      <Link
                        to={`/transactions?account=${acc._id}`}
                        className="text-xs text-vault-emeraldLight hover:underline mt-3 inline-block"
                      >
                        View statement →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Balance split</h3>
              <DonutChart data={balanceDistribution} centerLabel="Total" centerValue={fmt(totalBalance).replace("$", "")} />
              <ChartLegend data={balanceDistribution} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDashboard;