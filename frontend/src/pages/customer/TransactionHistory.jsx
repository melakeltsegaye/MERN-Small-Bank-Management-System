import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyAccounts, getAccountTransactions } from "../../api/accountApi";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const TransactionHistory = () => {
  const [searchParams] = useSearchParams();
  const { data: accountsData } = useQuery({ queryKey: ["my-accounts"], queryFn: getMyAccounts });
  const accounts = accountsData?.accounts || [];
  const [accountId, setAccountId] = useState(searchParams.get("account") || "");

  const { data, isLoading } = useQuery({
    queryKey: ["account-transactions", accountId],
    queryFn: () => getAccountTransactions(accountId),
    enabled: !!accountId,
  });

  return (
    <div>
      <PageHeader eyebrow="Records" title="Statement" description="Full transaction history for an account." />

      <div className="mb-6 max-w-sm">
        <label className="label">Account</label>
        <select className="input-field" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.accountType} •••• {a.accountNumber.slice(-4)}
            </option>
          ))}
        </select>
      </div>

      {!accountId ? (
        <div className="card p-8 text-center text-parchment-500">Select an account to view its statement.</div>
      ) : isLoading ? (
        <Loader label="Fetching statement" />
      ) : data?.transactions?.length === 0 ? (
        <div className="card p-8 text-center text-parchment-500">No transactions yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-700/50 text-parchment-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Reference</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-right px-4 py-3 font-medium">Balance after</th>
                <th className="text-right px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t) => (
                <tr key={t._id} className="border-t border-ink-700">
                  <td className="px-4 py-3 text-parchment-300">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{t.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-parchment-500">{t.referenceId}</td>
                  <td
                    className={`px-4 py-3 text-right amount-mono ${
                      t.type.includes("deposit") || t.type.includes("in") ? "text-vault-emeraldLight" : "text-red-300"
                    }`}
                  >
                    {t.type.includes("deposit") || t.type.includes("in") ? "+" : "-"}
                    {fmt(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right amount-mono">{fmt(t.balanceAfter)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge status={t.status} />
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

export default TransactionHistory;
