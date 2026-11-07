import React from "react";
import { BookHeart, Check, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { api, getErrorMessage } from "../services/api.js";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ rating: 0, review_text: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { api.get("/reviews/mine").then(({ data }) => setReviews(data)).catch((err) => setError(getErrorMessage(err))); }, []);
  function startEdit(review) { setEditingId(review.id); setEdit({ rating: review.rating, review_text: review.review_text }); setError(""); }
  async function saveEdit(reviewId) {
    try { const { data } = await api.put(`/reviews/${reviewId}`, edit); setReviews((items) => items.map((item) => item.id === reviewId ? { ...item, ...data } : item)); setEditingId(null); setNotice("Your review has been updated."); setError(""); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  async function deleteReview(review) {
    if (!window.confirm(`Delete your review of “${review.book.title}”?`)) return;
    try { await api.delete(`/reviews/${review.id}`); setReviews((items) => items.filter((item) => item.id !== review.id)); setNotice("Your review has been deleted."); setError(""); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  return <section className="page-section"><div className="page-title-row"><div><span className="eyebrow muted-eyebrow"><BookHeart size={13} /> YOUR READING NOTES</span><h1>Thoughts worth keeping.</h1><p>Your reviews, gathered in one place. Edit or revisit them anytime.</p></div>{reviews && <span className="collection-count">{reviews.length} REVIEWS</span>}</div>{error && <AlertMessage>{error}</AlertMessage>}{notice && <AlertMessage tone="success">{notice}</AlertMessage>}{reviews === null ? <LoadingState /> : reviews.length ? <div className="my-review-list">{reviews.map((review) => <article className="my-review-card" key={review.id}><Link to={`/books/${review.book.id}`} className="my-review-book"><div className="mini-cover">{review.book.cover_url && <img src={review.book.cover_url} alt="" />}</div><div><b>{review.book.title}</b><span>by {review.book.author}</span><small>{review.book.genre}</small></div></Link>{editingId === review.id ? <div className="review-edit-form"><RatingStars value={edit.rating} onChange={(rating) => setEdit({ ...edit, rating })} /><textarea value={edit.review_text} maxLength="2000" rows="4" onChange={(event) => setEdit({ ...edit, review_text: event.target.value })} /><div><button className="button button-primary button-small" onClick={() => saveEdit(review.id)}><Check size={14} /> Save changes</button><button className="button button-quiet button-small" onClick={() => setEditingId(null)}><X size={14} /> Cancel</button></div></div> : <div className="my-review-content"><div className="review-heading"><RatingStars value={review.rating} readOnly size={14} /><span className="review-date">{new Date(review.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span></div><p>{review.review_text}</p><div className="review-actions"><button className="text-button" onClick={() => startEdit(review)}><Pencil size={14} /> Edit</button><button className="text-button danger-text" onClick={() => deleteReview(review)}><Trash2 size={14} /> Delete</button></div></div>}</article>)}</div> : <EmptyState title="Your reading notes are waiting" message="Write a review on a book's page and it will be saved here." action={<Link to="/books" className="button button-primary">Find a book to review</Link>} />}</section>;
}
