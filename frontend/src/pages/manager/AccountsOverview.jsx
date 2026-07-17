import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccounts, updateAccountStatus } from "../../api/accountApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import OpenAccountForm from "../../components/common/OpenAccountForm";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const AccountsOverview = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["accounts", "all"], queryFn: () => getAccounts({ limit: 100 }) });
  const [showForm, setShowForm] = useState(false);

  const toggleFreeze = async (acc) => {
    const nextStatus = acc.status === "active" ? "frozen" : "active";
    await updateAccountStatus(acc._id, nextStatus);
    queryClient.invalidateQueries({ queryKey: ["accounts", "all"] });
  };

  const handleCreated = () => {
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["accounts", "all"] });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Oversight"
        title="All accounts"
        description="Freeze, unfreeze, review, or open new accounts."
        action={
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-sm">
            {showForm ? "Close" : "Open account"}
          </button>
        }
      />

      {showForm && (
        <div className="max-w-lg mb-8">
          <OpenAccountForm onCreated={handleCreated} />
        </div>
      )}

      {isLoading ? (
        <Loader label="Fetching accounts" />
      ) : (
        <div className="card overflow-hidden">
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
              {data?.accounts?.map((acc) => (
                <tr key={acc._id} className="border-t border-ink-700">
                  <td className="px-4 py-3">{acc.owner?.name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-parchment-500">•••• {acc.accountNumber.slice(-4)}</td>
                  <td className="px-4 py-3 text-right amount-mono">{fmt(acc.balance)}</td>
                  <td className="px-4 py-3 text-right"><Badge status={acc.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {acc.status !== "closed" && (
                      <button onClick={() => toggleFreeze(acc)} className="text-xs text-vault-goldLight hover:underline">
                        {acc.status === "active" ? "Freeze" : "Unfreeze"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountsOverview;