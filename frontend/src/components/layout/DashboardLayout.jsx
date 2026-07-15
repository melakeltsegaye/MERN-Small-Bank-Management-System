import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-ink-900">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
