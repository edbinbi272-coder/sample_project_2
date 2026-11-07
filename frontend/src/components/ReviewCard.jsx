import React from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import RatingStars from "./RatingStars.jsx";

export default function ReviewCard({ review, editable = false, onEdit, onDelete }) {
  const date = new Date(review.updated_at || review.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return (
    <article className="review-card">
      <div className="review-avatar">{review.username?.slice(0, 1).toUpperCase() || "R"}</div>
      <div className="review-body">
        <div className="review-heading"><div><b>{review.username || "You"}</b><span className="review-date"><CalendarDays size={13} />{date}</span></div><RatingStars value={review.rating} readOnly size={14} /></div>
        <p>{review.review_text}</p>
        {editable && <div className="review-actions"><button type="button" className="text-button" onClick={() => onEdit(review)}><Pencil size={14} /> Edit review</button><button type="button" className="text-button danger-text" onClick={() => onDelete(review)}><Trash2 size={14} /> Delete</button></div>}
      </div>
    </article>
  );
}
