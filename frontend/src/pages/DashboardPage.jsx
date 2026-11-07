import React from "react";
import { BookHeart, BookOpen, Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "../components/DashboardCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import RatingStars from "../components/RatingStars.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, getErrorMessage } from "../services/api.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/dashboard").then(({ data: result }) => setData(result)).catch((err) => setError(getErrorMessage(err))); }, []);
  if (error) return <div className="page-section"><div className="alert-message error">{error}</div></div>;
  if (!data) return <LoadingState label="Gathering your reading stats…" />;
  return <section className="page-section"><div className="page-title-row"><div><span className="eyebrow muted-eyebrow">YOUR READING LIFE</span><h1>Good to see you, {user?.username}.</h1><p>Every book you save and review becomes part of your story.</p></div><Link to="/books" className="button button-primary">Find your next read</Link></div>
    <div className="dashboard-grid"><DashboardCard icon={BookOpen} label="In the collection" value={data.total_books} note="Books to discover" /><DashboardCard icon={Heart} label="On your wishlist" value={data.wishlist_count} note="Stories saved for later" accent="gold" /><DashboardCard icon={BookHeart} label="Your reviews" value={data.review_count} note="Thoughts shared" accent="light" /><DashboardCard icon={Star} label="Your average rating" value={data.review_count ? `${data.average_rating_given.toFixed(1)} / 5` : "—"} note="Across your reviews" accent="gold" /></div>
    <div className="section-heading dashboard-section-heading"><div><span className="eyebrow muted-eyebrow">YOUR LATEST NOTES</span><h2>Recently reviewed</h2></div><Link className="arrow-link" to="/my-reviews">All reviews <span>→</span></Link></div>
    {data.recent_reviews.length ? <div className="recent-review-list">{data.recent_reviews.map((review) => <Link className="recent-review" to={`/books/${review.book.id}`} key={review.id}><div className="mini-cover">{review.book.cover_url && <img src={review.book.cover_url} alt="" />}</div><div className="recent-review-main"><b>{review.book.title}</b><span>by {review.book.author}</span><p>{review.review_text}</p></div><div className="recent-review-rating"><RatingStars value={review.rating} readOnly size={13} /><small>{new Date(review.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></div></Link>)}</div> : <EmptyState title="Your reading story starts here" message="Write a review after your first read and it will appear here." action={<Link className="button button-primary" to="/books">Browse books</Link>} />}
  </section>;
}
