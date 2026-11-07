import React from "react";
import { ArrowRight, Feather, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookCard from "../components/BookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { api, getErrorMessage } from "../services/api.js";

export default function DiscoverPage() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/books").then(({ data }) => setBooks(data)).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</span><h1>Find a book.<br /><em>Find yourself.</em></h1><p>A thoughtful collection for the curious, the dreamers, and everyone in between.</p><Link to="/books" className="button button-gold">Explore the collection <ArrowRight size={16} /></Link><div className="hero-footnote"><Feather size={15} /> A little corner of the internet for people who love a good story.</div></div>
        <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-book book-back" /><div className="hero-book book-front"><span>the art<br />of reading</span><small>READERS PARADISE</small></div><span className="hero-spark spark-a">✳</span><span className="hero-spark spark-b">✦</span><span className="hero-art-caption">STORIES THAT STAY WITH YOU</span></div>
      </section>
      <section className="section-block"><div className="section-heading"><div><span className="eyebrow muted-eyebrow">A FEW GOOD PLACES TO BEGIN</span><h2>Recently added</h2><p>Fresh stories, waiting to be discovered.</p></div><Link className="arrow-link" to="/books">View collection <ArrowRight size={15} /></Link></div>
        {error && <div className="alert-message error">{error}</div>}
        {loading ? <LoadingState /> : books.length ? <div className="book-grid">{books.slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)}</div> : <EmptyState title="Your reading room is ready" message="Add the first book to start building your collection." action={<Link className="button button-primary" to="/add-book">Add a book</Link>} />}
      </section>
      <section className="quote-band"><span className="quote-mark">“</span><p>We read to know we are not alone.</p><span>— C. S. LEWIS</span></section>
    </>
  );
}
