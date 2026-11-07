import React from "react";
import { ArrowLeft, BookPlus, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import { api, getErrorMessage } from "../services/api.js";

const emptyBook = { title: "", author: "", genre: "", description: "", cover_url: "" };
export default function AddBookPage() {
  const [form, setForm] = useState(emptyBook);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { const { data } = await api.post("/books", { ...form, cover_url: form.cover_url.trim() || null }); navigate(`/books/${data.id}`); }
    catch (err) { setError(getErrorMessage(err, "Unable to add this book.")); }
    finally { setBusy(false); }
  }
  return <section className="page-section narrow-page"><Link className="back-link" to="/books"><ArrowLeft size={15} /> Back to collection</Link><div className="form-heading-icon"><BookPlus size={21} /></div><span className="eyebrow muted-eyebrow">GROW THE COLLECTION</span><h1>Add a story to the shelves.</h1><p className="page-intro">Share a book you love so another reader can find it.</p><AlertMessage>{error}</AlertMessage><form className="stacked-form content-form" onSubmit={submit}><label>Book title<input required maxLength="200" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="The name on the cover" /></label><div className="form-row"><label>Author<input required maxLength="160" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} placeholder="Who wrote it?" /></label><label>Genre<input required maxLength="80" value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} placeholder="e.g. Fiction, History" /></label></div><label>Cover image URL <span className="optional-label">optional</span><input type="url" maxLength="1000" value={form.cover_url} onChange={(event) => setForm({ ...form, cover_url: event.target.value })} placeholder="https://example.com/book-cover.jpg" /></label><label>Description<textarea rows="6" maxLength="10000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What makes this book special?" /></label><button className="button button-primary form-submit" disabled={busy}>{busy ? "Adding to collection…" : "Add to the collection"}<Check size={16} /></button></form></section>;
}
