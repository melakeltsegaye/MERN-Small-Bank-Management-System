import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await registerUser(values);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-ledger-lines opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-72 h-72 rounded-full bg-vault-emerald/10 blur-3xl animate-glowPulse pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-72 h-72 rounded-full bg-vault-gold/10 blur-3xl animate-glowPulse pointer-events-none" style={{ animationDelay: "1.5s" }} />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-vault-gold flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(201,162,39,0.4)] animate-float">
            <span className="text-ink-950 font-display font-bold text-xl">V</span>
          </div>
          <h1 className="font-display text-2xl font-semibold">Open an account</h1>
          <p className="text-parchment-500 text-sm mt-1 font-mono tracking-wide uppercase">Customer registration</p>
        </div>

        {success ? (
          <div className="card p-6 text-center">
            <p className="text-vault-emeraldLight font-medium">Account created.</p>
            <p className="text-parchment-500 text-sm mt-1">Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
            {serverError && (
              <div className="bg-vault-alert/10 border border-vault-alert/30 text-red-300 text-sm rounded-lg px-3.5 py-2.5">
                {serverError}
              </div>
            )}

            <div>
              <label className="label">Full name</label>
              <input className="input-field" placeholder="Jane Doe" {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="text-xs text-red-300 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" {...register("email", { required: "Email is required" })} />
              {errors.email && <p className="text-xs text-red-300 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone</label>
              <input className="input-field" placeholder="+251 900 0000 00" {...register("phone")} />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 8 characters"
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
              />
              {errors.password && <p className="text-xs text-red-300 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-parchment-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-vault-goldLight hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;