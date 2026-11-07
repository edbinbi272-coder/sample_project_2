import React from "react";
import { CircleAlert } from "lucide-react";
export default function AlertMessage({ children, tone = "error" }) {
  if (!children) return null;
  return <div className={`alert-message ${tone}`} role={tone === "error" ? "alert" : "status"}><CircleAlert size={17} />{children}</div>;
}
