import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink px-6 text-center">
    <div>
      <p className="font-mono text-brass text-sm mb-3">404</p>
      <h1 className="font-display text-3xl mb-3">No entry found in the ledger</h1>
      <p className="text-paper-dim mb-6">That page doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex">Return home</Link>
    </div>
  </div>
);

export default NotFound;
