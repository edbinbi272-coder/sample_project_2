import React from "react";
import { ArrowUpRight, BookmarkPlus } from "lucide-react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars.jsx";

export default function BookCard({ book, onWishlist, saved = false }) {
  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-cover-link" aria-label={`View ${book.title}`}>
        {book.cover_url ? <img className="book-cover" src={book.cover_url} alt={`Cover of ${book.title}`} loading="lazy" /> : <div className="book-cover cover-placeholder"><BookCoverMark /></div>}
        <span className="cover-shade" />
      </Link>
      {onWishlist && <button className={`cover-action${saved ? " saved" : ""}`} type="button" onClick={() => onWishlist(book)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}><BookmarkPlus size={17} /></button>}
      <div className="book-card-info">
        <span className="genre-tag">{book.genre}</span>
        <Link to={`/books/${book.id}`} className="book-title-link"><h3>{book.title}<ArrowUpRight size={14} /></h3></Link>
        <p className="book-author">by {book.author}</p>
        <div className="book-rating-line"><RatingStars value={book.average_rating} readOnly size={13} /><span>{book.review_count ? book.average_rating.toFixed(1) : "New"}</span></div>
      </div>
    </article>
  );
}

function BookCoverMark() {
  return <span className="cover-mark"><span>RP</span><i /></span>;
}
