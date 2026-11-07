import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  return (
    <div className={isAuthPage ? "app-shell auth-shell" : "app-shell"}>
      {!isAuthPage && <Sidebar />}
      <div className="app-main">
        <Navbar compact={isAuthPage} />
        <main className={isAuthPage ? "page-content auth-content" : "page-content"}>
          <Outlet />
        </main>
        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
}
