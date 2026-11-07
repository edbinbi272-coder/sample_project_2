import React from "react";
import { ArrowLeft, BookmarkPlus, CalendarDays, Check, PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import LoadingState from "../components/LoadingState.jsx";
import RatingStars from "../components/RatingStars.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/books/${bookId}`), api.get(`/books/${bookId}/reviews`), user ? api.get("/wishlist") : Promise.resolve({ data: [] })])
      .then(([bookResult, reviewResult, wishResult]) => {
        if (!active) return;
        setBook(bookResult.data); setReviews(reviewResult.data); setSaved(wishResult.data.some((item) => item.id === Number(bookId)));
        const ownReview = reviewResult.data.find((item) => item.user_id === user?.id);
        if (ownReview) { setRating(ownReview.rating); setReviewText(ownReview.review_text); }
      })
      .catch((err) => setError(getErrorMessage(err, "This book could not be loaded.")))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId, user]);

  async function toggleWishlist() {
    setError(""); setNotice("");
    try {
      if (saved) { await api.delete(`/wishlist/${bookId}`); setSaved(false); setNotice("Removed from your wishlist."); }
      else { await api.post(`/wishlist/${bookId}`); setSaved(true); setNotice("Saved to your wishlist."); }
    } catch (err) { setError(getErrorMessage(err)); }
  }

  async function submitReview(event) {
    event.preventDefault(); setError(""); setNotice("");
    if (!rating) { setError("Choose a star rating before submitting your review."); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/reviews/${bookId}`, { rating, review_text: reviewText.trim() });
      setReviews((items) => [data, ...items.filter((item) => item.id !== data.id)]);
      setNotice("Your review has been saved.");
      const { data: updatedBook } = await api.get(`/books/${bookId}`); setBook(updatedBook);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  if (loading) return <LoadingState label="Opening this book…" />;
  if (error && !book) return <div className="page-section"><AlertMessage>{error}</AlertMessage><Link className="arrow-link" to="/books"><ArrowLeft size={15} /> Back to collection</Link></div>;
  const ownReview = reviews.find((review) => review.user_id === user?.id);
  return <section className="page-section"><Link className="back-link" to="/books"><ArrowLeft size={15} /> Back to the collection</Link>{error && <AlertMessage>{error}</AlertMessage>}{notice && <AlertMessage tone="success">{notice}</AlertMessage>}
    <div className="book-detail"><div className="detail-cover-wrap">{book.cover_url ? <img className="detail-cover" src={book.cover_url} alt={`Cover of ${book.title}`} /> : <div className="detail-cover detail-cover-empty"><BookOpenDecor /></div>}</div><div className="detail-copy"><span className="genre-tag">{book.genre}</span><h1>{book.title}</h1><p className="detail-author">by {book.author}</p><div className="detail-rating"><RatingStars value={book.average_rating} readOnly size={17} /><b>{book.review_count ? book.average_rating.toFixed(1) : "New"}</b><span>{book.review_count} {book.review_count === 1 ? "review" : "reviews"}</span></div><p className="detail-description">{book.description || "A new story is waiting to be written. Check back for more details about this title."}</p><div className="detail-meta"><span><CalendarDays size={15} /> Added {new Date(book.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span></div><button className={`button ${saved ? "button-outline" : "button-primary"}`} type="button" onClick={user ? toggleWishlist : () => { window.location.href = "/login"; }}>{saved ? <><Check size={16} /> Saved to wishlist</> : <><BookmarkPlus size={16} /> Add to wishlist</>}</button>{!user && <p className="detail-login-note">Sign in to save books and write reviews.</p>}</div></div>
    <div className="book-lower-grid"><section className="review-panel"><div className="section-heading"><div><span className="eyebrow muted-eyebrow">THE READING ROOM</span><h2>Reader reviews <span className="heading-count">{reviews.length}</span></h2></div></div>{reviews.length ? <div className="review-list">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div> : <div className="review-empty">No reviews yet. Be the first to share what you think.</div>}</section>
      <aside className="write-review-card"><span className="write-review-icon"><PenLine size={18} /></span><span className="eyebrow muted-eyebrow">YOUR TAKE</span><h2>{ownReview ? "Update your review" : "Have you read it?"}</h2><p>{ownReview ? "Your review can be changed anytime." : "Leave a note for the next reader who finds this story."}</p>{user ? <form className="review-form" onSubmit={submitReview}><label>Your rating</label><RatingStars value={rating} onChange={setRating} /><label htmlFor="review-text">Your review</label><textarea id="review-text" rows="5" maxLength="2000" required value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="What stayed with you after the last page?" /><small>{reviewText.length}/2000</small><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : ownReview ? "Update review" : "Post review"}</button></form> : <Link className="button button-primary full-width" to="/login">Sign in to review</Link>}</aside></div>
  </section>;
}

function BookOpenDecor() { return <span className="cover-mark"><span>RP</span><i /></span>; }
