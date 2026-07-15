import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center text-center px-4">
    <p className="font-mono text-vault-alert text-sm tracking-widest mb-2">403</p>
    <h1 className="font-display text-3xl font-semibold mb-3">Not authorized</h1>
    <p className="text-parchment-500 mb-6">Your role doesn't have access to this page.</p>
    <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
  </div>
);

export default Unauthorized;
