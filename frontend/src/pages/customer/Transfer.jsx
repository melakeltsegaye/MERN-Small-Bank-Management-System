import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getMyAccounts } from "../../api/accountApi";
import { transferFunds } from "../../api/transactionApi";
import PageHeader from "../../components/common/PageHeader";

const Transfer = () => {
  const { data } = useQuery({ queryKey: ["my-accounts"], queryFn: getMyAccounts });
  const accounts = data?.accounts || [];
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setMessage(null);
    setSubmitting(true);
    try {
      await transferFunds({
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        amount: Number(values.amount),
        description: values.description,
      });
      setMessage({ type: "success", text: "Transfer complete." });
      reset();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Transfer failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <PageHeader eyebrow="Move money" title="Transfer funds" description="Move funds between accounts by account ID." />

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
          <label className="label">From account</label>
          <select className="input-field" {...register("fromAccountId", { required: true })}>
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.accountType} •••• {a.accountNumber.slice(-4)} — ${a.balance.toFixed(2)}
              </option>
            ))}
          </select>
          {errors.fromAccountId && <p className="text-xs text-red-300 mt-1">Please select an account</p>}
        </div>

        <div>
          <label className="label">To account (Account ID)</label>
          <input className="input-field font-mono text-sm" placeholder="Recipient account ID" {...register("toAccountId", { required: true })} />
          {errors.toAccountId && <p className="text-xs text-red-300 mt-1">Recipient account ID is required</p>}
        </div>

        <div>
          <label className="label">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input-field amount-mono"
            placeholder="0.00"
            {...register("amount", { required: true, min: 0.01 })}
          />
          {errors.amount && <p className="text-xs text-red-300 mt-1">Enter a valid amount</p>}
        </div>

        <div>
          <label className="label">Note (optional)</label>
          <input className="input-field" placeholder="e.g. Rent split" {...register("description")} />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Processing…" : "Transfer"}
        </button>
      </form>
    </div>
  );
};

export default Transfer;
