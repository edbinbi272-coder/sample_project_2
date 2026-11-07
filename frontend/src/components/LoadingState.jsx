import React from "react";
export default function LoadingState({ label = "Loading your library…" }) {
  return <div className="loading-state" role="status"><span className="spinner" /><span>{label}</span></div>;
}
