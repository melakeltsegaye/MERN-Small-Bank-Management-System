import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import Badge from "../../components/common/Badge.jsx";
import Alert from "../../components/common/Alert.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getMyAccountsApi } from "../../api/accountApi.js";
import { applyForLoanApi, getMyLoansApi } from "../../api/loanApi.js";

const currency = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const LOAN_TYPES = ["personal", "home", "auto", "education", "business"];

const Loans = () => {
  const [accounts, setAccounts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    disbursementAccount: "",
    loanType: "personal",
    principal: "",
    interestRate: "12",
    tenureMonths: "12",
    purpose: "",
  });

  const load = async () => {
    setLoading(true);
    const [accRes, loanRes] = await Promise.all([getMyAccountsApi(), getMyLoansApi()]);
    setAccounts(accRes.data.accounts);
    setLoans(loanRes.data.loans);
    if (accRes.data.accounts.length) {
      setForm((f) => ({ ...f, disbursementAccount: accRes.data.accounts[0]._id }));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await applyForLoanApi({
        ...form,
        principal: Number(form.principal),
        interestRate: Number(form.interestRate),
        tenureMonths: Number(form.tenureMonths),
      });
      setSuccess("Loan application submitted for review.");
      setForm((f) => ({ ...f, principal: "", purpose: "" }));
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl mb-8">Loans</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="font-display text-xl">Your applications</h2>
          {loans.length === 0 ? (
            <EmptyState title="No loan applications" description="Apply using the form to your right." />
          ) : (
            loans.map((loan) => (
              <div key={loan._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs text-paper-dim">{loan.referenceId}</p>
                    <p className="font-display text-lg capitalize">{loan.loanType} loan</p>
                  </div>
                  <Badge>{loan.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-paper-dim text-xs uppercase tracking-wide mb-0.5">Principal</p>
                    <p className="figure">{currency(loan.principal)}</p>
                  </div>
                  <div>
                    <p className="text-paper-dim text-xs uppercase tracking-wide mb-0.5">Rate</p>
                    <p className="figure">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-paper-dim text-xs uppercase tracking-wide mb-0.5">Tenure</p>
                    <p className="figure">{loan.tenureMonths} mo</p>
                  </div>
                </div>
                {loan.emiAmount > 0 && (
                  <p className="text-sm text-paper-dim mt-3">
                    EMI: <span className="figure text-paper">{currency(loan.emiAmount)}</span> / month
                  </p>
                )}
                {loan.rejectionReason && (
                  <p className="text-sm text-signal-red mt-3">Reason: {loan.rejectionReason}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl mb-4">Apply for a loan</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Alert>{error}</Alert>
              <Alert type="success">{success}</Alert>

              <div>
                <label className="field-label">Disbursement account</label>
                <select className="field-input" name="disbursementAccount" value={form.disbursementAccount} onChange={handleChange}>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountType} · •••• {acc.accountNumber.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Loan type</label>
                <select className="field-input" name="loanType" value={form.loanType} onChange={handleChange}>
                  {LOAN_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Principal (USD)</label>
                <input
                  className="field-input figure"
                  type="number"
                  name="principal"
                  min="1"
                  required
                  value={form.principal}
                  onChange={handleChange}
                  placeholder="5000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Rate (% annual)</label>
                  <input className="field-input figure" type="number" name="interestRate" value={form.interestRate} onChange={handleChange} />
                </div>
                <div>
                  <label className="field-label">Tenure (months)</label>
                  <input className="field-input figure" type="number" name="tenureMonths" value={form.tenureMonths} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="field-label">Purpose</label>
                <input className="field-input" name="purpose" value={form.purpose} onChange={handleChange} placeholder="What's the loan for?" />
              </div>

              <button type="submit" disabled={submitting || !accounts.length} className="btn-primary mt-1">
                {submitting ? "Submitting…" : "Submit application"}
              </button>
              {!accounts.length && <p className="text-xs text-paper-dim">You need an open account before applying.</p>}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Loans;
