import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, ArrowDownToLine, ArrowUpFromLine, Send, ReceiptText,
  FileText, Wallet2, Users, ClipboardList, Landmark, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = {
  customer: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid },
    { to: "/deposit", label: "Deposit", icon: ArrowDownToLine },
    { to: "/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
    { to: "/transfer", label: "Transfer", icon: Send },
    { to: "/transactions", label: "Statement", icon: ReceiptText },
    { to: "/loans/apply", label: "Apply for loan", icon: FileText },
    { to: "/loans/mine", label: "My loans", icon: Wallet2 },
  ],
  employee: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid },
    { to: "/accounts", label: "Customer accounts", icon: Landmark },
  ],
  loan_officer: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid },
    { to: "/loans", label: "Loan queue", icon: ClipboardList },
  ],
  manager: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid },
    { to: "/accounts", label: "Accounts", icon: Landmark },
    { to: "/loans", label: "Loan approvals", icon: ClipboardList },
    { to: "/employees", label: "Employees", icon: Users },
  ],
  admin: [
    { to: "/dashboard", label: "Overview", icon: LayoutGrid },
    { to: "/employees", label: "Staff & roles", icon: ShieldCheck },
    { to: "/accounts", label: "Accounts", icon: Landmark },
    { to: "/loans", label: "Loans", icon: ClipboardList },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const items = NAV[user?.role] || [];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-ink-950 border-r border-ink-700 min-h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-ink-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-vault-gold flex items-center justify-center shadow-[0_0_20px_rgba(201,162,39,0.35)]">
            <span className="text-ink-950 font-display font-bold text-sm">V</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Vaultline</span>
        </div>
        <p className="text-[11px] text-parchment-500 font-mono mt-1 tracking-widest uppercase">
          {user?.role?.replace("_", " ")} access
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-vault-gold/10 text-vault-goldLight border-l-2 border-vault-gold"
                    : "text-parchment-300 hover:bg-ink-800 hover:text-parchment-100 border-l-2 border-transparent"
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-ink-700">
        <p className="text-[11px] text-parchment-500 font-mono leading-relaxed">
          Ledger integrity <br /> verified continuously.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;