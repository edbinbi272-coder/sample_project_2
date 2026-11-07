import React from "react";
export default function DashboardCard({ icon: Icon, label, value, note, accent = "green" }) {
  return <article className={`dashboard-card accent-${accent}`}><span className="dashboard-icon"><Icon size={19} /></span><span className="dashboard-label">{label}</span><strong>{value}</strong><small>{note}</small></article>;
}
