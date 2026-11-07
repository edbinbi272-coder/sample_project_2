import React from "react";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookCard from "../components/BookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { api, getErrorMessage } from "../services/api.js";

export default function WishlistPage() {
  const [books, setBooks] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/wishlist").then(({ data }) => setBooks(data)).catch((err) => setError(getErrorMessage(err))); }, []);
  async function removeBook(book) {
    try { await api.delete(`/wishlist/${book.id}`); setBooks((items) => items.filter((item) => item.id !== book.id)); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  return <section className="page-section"><div className="page-title-row"><div><span className="eyebrow muted-eyebrow"><Heart size={13} /> YOUR PERSONAL SHELF</span><h1>Saved for a quieter day.</h1><p>All the stories you mean to spend time with, in one place.</p></div>{books && <span className="collection-count">{books.length} SAVED</span>}</div>{error && <div className="alert-message error">{error}</div>}{books === null ? <LoadingState /> : books.length ? <div className="book-grid collection-grid">{books.map((book) => <BookCard key={book.id} book={book} saved onWishlist={removeBook} />)}</div> : <EmptyState title="A shelf with room for more" message="Save a book that catches your eye and it will be waiting here." action={<Link className="button button-primary" to="/books">Explore the collection</Link>} />}</section>;
}
