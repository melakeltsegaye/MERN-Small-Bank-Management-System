import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getMyAccountsApi } from "../../api/accountApi.js";
import { getAccountTransactionsApi } from "../../api/transactionApi.js";

const currency = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const TYPE_SIGN = {
  deposit: "+",
  transfer_in: "+",
  loan_disbursement: "+",
  withdrawal: "−",
  transfer_out: "−",
  loan_repayment: "−",
};

const Transactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await getMyAccountsApi();
      setAccounts(data.accounts);
      if (data.accounts.length) setAccountId(data.accounts[0]._id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!accountId) return;
    (async () => {
      setLoading(true);
      const { data } = await getAccountTransactionsApi(accountId);
      setTransactions(data.transactions);
      setLoading(false);
    })();
  }, [accountId]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Transaction history</h1>
        {accounts.length > 0 && (
          <select className="field-input !w-auto" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountType} · •••• {acc.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" description="Deposits, withdrawals, and transfers on this account will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left text-paper-dim text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-ink-line last:border-0 hover:bg-ink-raised/50">
                  <td className="px-5 py-3 font-mono text-xs text-paper-dim">{t.referenceId}</td>
                  <td className="px-5 py-3 capitalize">{t.type.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-paper-dim">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className={`px-5 py-3 text-right figure ${TYPE_SIGN[t.type] === "−" ? "text-signal-red" : "text-sage-bright"}`}>
                    {TYPE_SIGN[t.type]} {currency(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-right figure text-paper-dim">{currency(t.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Transactions;
