import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink px-6 text-center">
    <div>
      <p className="font-mono text-brass text-sm mb-3">403</p>
      <h1 className="font-display text-3xl mb-3">This vault isn't yours to open</h1>
      <p className="text-paper-dim mb-6">Your role doesn't have access to this area.</p>
      <Link to="/" className="btn-primary inline-flex">Return home</Link>
    </div>
  </div>
);

export default Unauthorized;
