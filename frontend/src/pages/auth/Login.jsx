import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROLE_REDIRECT = {
  customer: "/dashboard",
  employee: "/dashboard",
  loan_officer: "/dashboard",
  manager: "/dashboard",
  admin: "/dashboard",
};

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      navigate(ROLE_REDIRECT[user.role] || "/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-ledger-lines opacity-40 pointer-events-none" />
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-vault-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-ink-950 font-display font-bold text-xl">V</span>
          </div>
          <h1 className="font-display text-2xl font-semibold">Vaultline</h1>
          <p className="text-parchment-500 text-sm mt-1 font-mono tracking-wide uppercase">Sign in to your vault</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          {serverError && (
            <div className="bg-vault-alert/10 border border-vault-alert/30 text-red-300 text-sm rounded-lg px-3.5 py-2.5">
              {serverError}
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-red-300 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-xs text-red-300 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-parchment-500 mt-6">
          New to Vaultline?{" "}
          <Link to="/register" className="text-vault-goldLight hover:underline">
            Open an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
