import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center text-center px-4">
    <p className="font-mono text-vault-gold text-sm tracking-widest mb-2">404</p>
    <h1 className="font-display text-3xl font-semibold mb-3">Page not found</h1>
    <p className="text-parchment-500 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
  </div>
);

export default NotFound;
