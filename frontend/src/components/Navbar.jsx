import React from "react";
import { BookOpen, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ compact = false }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/books?q=${encodeURIComponent(value)}` : "/books");
  }

  return (
    <header className="topbar">
      <Link className="mobile-brand" to="/" aria-label="Readers Paradise home"><BookOpen size={21} /><span>READERS <b>PARADISE</b></span></Link>
      {!compact && <form className="top-search" onSubmit={handleSearch}>
        <Search size={17} aria-hidden="true" />
        <input aria-label="Search the collection" placeholder="Search books, authors, genres…" value={query} onChange={(event) => setQuery(event.target.value)} />
        <kbd>↵</kbd>
      </form>}
      <div className="topbar-actions">
        {user ? <Link className="profile-pill" to="/profile"><span className="avatar-small">{user.username.slice(0, 1).toUpperCase()}</span><span>{user.username}</span><UserRound size={15} /></Link> : <Link className="button button-outline button-small" to="/login">Sign in</Link>}
      </div>
    </header>
  );
}
