import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getMyAccounts } from "../../api/accountApi";
import { applyForLoan } from "../../api/loanApi";
import PageHeader from "../../components/common/PageHeader";

const LOAN_TYPES = ["personal", "home", "auto", "education", "business"];

const LoanApply = () => {
  const { data } = useQuery({ queryKey: ["my-accounts"], queryFn: getMyAccounts });
  const accounts = data?.accounts || [];
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await applyForLoan({
        disbursementAccount: values.disbursementAccount,
        loanType: values.loanType,
        principal: Number(values.principal),
        interestRate: Number(values.interestRate),
        tenureMonths: Number(values.tenureMonths),
        purpose: values.purpose,
      });
      setMessage({ type: "success", text: `Application submitted. Reference: ${res.loan.referenceId}` });
      reset();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Application failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader eyebrow="Credit" title="Apply for a loan" description="Submit a loan application for review." />

      {message && (
        <div
          className={`text-sm rounded-lg px-3.5 py-2.5 mb-4 border ${
            message.type === "success"
              ? "bg-vault-emerald/10 border-vault-emerald/30 text-vault-emeraldLight"
              : "bg-vault-alert/10 border-vault-alert/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="label">Disbursement account</label>
          <select className="input-field" {...register("disbursementAccount", { required: true })}>
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.accountType} •••• {a.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
          {errors.disbursementAccount && <p className="text-xs text-red-300 mt-1">Required</p>}
        </div>

        <div>
          <label className="label">Loan type</label>
          <select className="input-field" {...register("loanType", { required: true })}>
            {LOAN_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Principal (USD)</label>
            <input
              type="number"
              step="0.01"
              className="input-field amount-mono"
              placeholder="10000"
              {...register("principal", { required: true, min: 1 })}
            />
          </div>
          <div>
            <label className="label">Tenure (months)</label>
            <input
              type="number"
              className="input-field amount-mono"
              placeholder="24"
              {...register("tenureMonths", { required: true, min: 1 })}
            />
          </div>
        </div>

        <div>
          <label className="label">Interest rate (annual %)</label>
          <input
            type="number"
            step="0.01"
            className="input-field amount-mono"
            placeholder="8.5"
            {...register("interestRate", { required: true, min: 0 })}
          />
        </div>

        <div>
          <label className="label">Purpose</label>
          <textarea className="input-field" rows="3" placeholder="What is this loan for?" {...register("purpose")} />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
};

export default LoanApply;
