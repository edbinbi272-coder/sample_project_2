import React from "react";
import { Star } from "lucide-react";

export default function RatingStars({ value = 0, onChange, readOnly = false, size = 18, label = "Choose a rating" }) {
  return (
    <span className={`rating-stars${readOnly ? " read-only" : ""}`} role={readOnly ? "img" : "group"} aria-label={readOnly ? `${Number(value).toFixed(1)} out of 5 stars` : label}>
      {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" className={`star-button${star <= value ? " filled" : ""}`} onClick={readOnly ? undefined : () => onChange?.(star)} disabled={readOnly} aria-label={`${star} ${star === 1 ? "star" : "stars"}`}><Star size={size} fill={star <= value ? "currentColor" : "none"} strokeWidth={1.7} /></button>)}
    </span>
  );
}
