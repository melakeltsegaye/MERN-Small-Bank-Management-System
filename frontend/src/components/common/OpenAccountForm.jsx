import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { openAccount } from "../../api/accountApi";

const ACCOUNT_TYPES = ["savings", "current", "fixed_deposit"];

const OpenAccountForm = ({ onCreated }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setMessage(null);
    setSubmitting(true);
    try {
      await openAccount({
        owner: values.owner,
        accountType: values.accountType,
        branch: values.branch,
        minimumBalance: values.minimumBalance ? Number(values.minimumBalance) : 0,
        interestRate: values.interestRate ? Number(values.interestRate) : 0,
      });
      setMessage({ type: "success", text: "Account opened successfully." });
      reset();
      onCreated?.();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to open account" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-lg">Open account</h3>
        <p className="text-xs text-parchment-500 mt-1">
          Paste the customer's User ID (found on the Staff &amp; roles page, or ask them for the ID shown after registration).
        </p>
      </div>

      {message && (
        <div
          className={`text-xs rounded-lg px-3 py-2 border ${
            message.type === "success"
              ? "bg-vault-emerald/10 border-vault-emerald/30 text-vault-emeraldLight"
              : "bg-vault-alert/10 border-vault-alert/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="label">Customer User ID</label>
        <input
          className="input-field font-mono text-sm"
          placeholder="e.g. 66f1a2b3c4d5e6f7a8b9c0d1"
          {...register("owner", { required: true })}
        />
        {errors.owner && <p className="text-xs text-red-300 mt-1">Required</p>}
      </div>

      <div>
        <label className="label">Account type</label>
        <select className="input-field" {...register("accountType", { required: true })}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Branch</label>
        <input className="input-field" placeholder="Downtown" {...register("branch")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Minimum balance</label>
          <input type="number" step="0.01" className="input-field amount-mono" placeholder="0.00" {...register("minimumBalance")} />
        </div>
        <div>
          <label className="label">Interest rate (%)</label>
          <input type="number" step="0.01" className="input-field amount-mono" placeholder="2.5" {...register("interestRate")} />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Opening…" : "Open account"}
      </button>
    </form>
  );
};

export default OpenAccountForm;