import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { api, getErrorMessage } from "../services/api.js";

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setQuery(searchParams.get("q") || ""); setGenre(searchParams.get("genre") || ""); }, [searchParams]);
  useEffect(() => { api.get("/books/genres").then(({ data }) => setGenres(data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (genre) params.genre = genre;
    api.get("/books", { params }).then(({ data }) => { setBooks(data); setError(""); }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, [query, genre]);

  function submitSearch(event) { event.preventDefault(); setSearchParams({ ...(query.trim() ? { q: query.trim() } : {}), ...(genre ? { genre } : {}) }); }
  return <section className="page-section"><div className="page-title-row"><div><span className="eyebrow muted-eyebrow">THE COLLECTION</span><h1>Books for every kind of day.</h1><p>Browse a carefully growing library of stories, ideas, and worlds.</p></div><span className="collection-count">{books.length} {books.length === 1 ? "BOOK" : "BOOKS"}</span></div>
    <SearchBar query={query} onQueryChange={setQuery} genre={genre} onGenreChange={setGenre} genres={genres} onSubmit={submitSearch} />
    {error && <div className="alert-message error">{error}</div>}
    {loading ? <LoadingState /> : books.length ? <div className="book-grid collection-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div> : <EmptyState title="No books found" message="Try another title, author, or genre — the right story is here somewhere." />}
  </section>;
}
