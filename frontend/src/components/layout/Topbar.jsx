import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 bg-ink-900/90 backdrop-blur border-b border-ink-700 px-5 md:px-8 py-4 flex items-center justify-between">
      <div className="md:hidden font-display font-semibold text-lg">Vaultline</div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-parchment-100">{user?.name}</p>
          <p className="text-xs text-parchment-500 capitalize">{user?.role?.replace("_", " ")}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-vault-emerald/20 border border-vault-emerald/40 flex items-center justify-center text-vault-emeraldLight font-display font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <button onClick={handleLogout} className="btn-secondary !px-3 !py-2 text-xs">
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Topbar;
