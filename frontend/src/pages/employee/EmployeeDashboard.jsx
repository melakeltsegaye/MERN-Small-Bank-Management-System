import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Landmark } from "lucide-react";
import { getAccounts } from "../../api/accountApi";
import { depositToAccount, withdrawFromAccount } from "../../api/transactionApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import DonutChart, { ChartLegend } from "../../components/charts/DonutChart";
import OpenAccountForm from "../../components/common/OpenAccountForm";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const EmployeeDashboard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["accounts"], queryFn: () => getAccounts({ limit: 50 }) });
  const [activeAccount, setActiveAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("deposit");
  const [message, setMessage] = useState(null);
  const [showOpenForm, setShowOpenForm] = useState(false);

  const accounts = data?.accounts || [];
  const totalManaged = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    accounts.forEach((a) => (counts[a.status] = (counts[a.status] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [accounts]);

  const handleAction = async () => {
    if (!activeAccount || !amount) return;
    setMessage(null);
    try {
      const fn = mode === "deposit" ? depositToAccount : withdrawFromAccount;
      await fn(activeAccount._id, { amount: Number(amount), description: `Teller ${mode}` });
      setMessage({ type: "success", text: `${mode === "deposit" ? "Deposit" : "Withdrawal"} processed.` });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Action failed" });
    }
  };

  const handleAccountCreated = () => {
    setShowOpenForm(false);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Branch operations"
        title="Customer accounts"
        description="Process deposits and withdrawals for customers."
        action={
          <button onClick={() => setShowOpenForm((s) => !s)} className="btn-primary text-sm">
            {showOpenForm ? "Close" : "Open account"}
          </button>
        }
      />

      {showOpenForm && (
        <div className="max-w-lg mb-8">
          <OpenAccountForm onCreated={handleAccountCreated} />
        </div>
      )}

      {isLoading ? (
        <Loader label="Fetching accounts" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Accounts managed" value={accounts.length} icon={Users} />
            <StatCard label="Total on deposit" value={fmt(totalManaged)} accent="emerald" icon={Landmark} />
            <StatCard label="Active" value={accounts.filter((a) => a.status === "active").length} accent="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ink-700/50 text-parchment-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Owner</th>
                    <th className="text-left px-4 py-3 font-medium">Account</th>
                    <th className="text-right px-4 py-3 font-medium">Balance</th>
                    <th className="text-right px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc._id} className="border-t border-ink-700 hover:bg-ink-700/20 transition-colors">
                      <td className="px-4 py-3">{acc.owner?.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-parchment-500">•••• {acc.accountNumber.slice(-4)}</td>
                      <td className="px-4 py-3 text-right amount-mono">{fmt(acc.balance)}</td>
                      <td className="px-4 py-3 text-right"><Badge status={acc.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setActiveAccount(acc)}
                          className="text-xs text-vault-goldLight hover:underline"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-display font-semibold text-lg mb-1">Process transaction</h3>
                {activeAccount ? (
                  <p className="text-xs text-parchment-500 mb-4 font-mono">
                    {activeAccount.owner?.name} — •••• {activeAccount.accountNumber.slice(-4)}
                  </p>
                ) : (
                  <p className="text-xs text-parchment-500 mb-4">Select an account from the table.</p>
                )}

                {message && (
                  <div
                    className={`text-xs rounded-lg px-3 py-2 mb-3 border ${
                      message.type === "success"
                        ? "bg-vault-emerald/10 border-vault-emerald/30 text-vault-emeraldLight"
                        : "bg-vault-alert/10 border-vault-alert/30 text-red-300"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setMode("deposit")}
                    className={`flex-1 text-xs py-2 rounded-lg border ${mode === "deposit" ? "bg-vault-gold/10 border-vault-gold text-vault-goldLight" : "border-ink-600 text-parchment-500"}`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setMode("withdraw")}
                    className={`flex-1 text-xs py-2 rounded-lg border ${mode === "withdraw" ? "bg-vault-gold/10 border-vault-gold text-vault-goldLight" : "border-ink-600 text-parchment-500"}`}
                  >
                    Withdraw
                  </button>
                </div>

                <input
                  type="number"
                  step="0.01"
                  className="input-field amount-mono mb-3"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <button onClick={handleAction} disabled={!activeAccount || !amount} className="btn-primary w-full">
                  Confirm {mode}
                </button>
              </div>

              <div className="card p-5">
                <h3 className="text-sm uppercase tracking-wider text-parchment-500 font-medium mb-2">Account status</h3>
                <DonutChart data={statusBreakdown} height={160} centerLabel="Accounts" centerValue={accounts.length} />
                <ChartLegend data={statusBreakdown} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;