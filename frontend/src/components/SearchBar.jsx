import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar({ query, onQueryChange, genre, onGenreChange, genres = [], onSubmit }) {
  return (
    <form className="catalog-search" onSubmit={onSubmit}>
      <label className="catalog-input"><Search size={18} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search by title or author" aria-label="Search by title or author" /></label>
      <label className="genre-select"><SlidersHorizontal size={16} /><span className="sr-only">Filter by genre</span><select value={genre} onChange={(event) => onGenreChange(event.target.value)}><option value="">All genres</option>{genres.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <button className="button button-primary" type="submit">Find a book</button>
    </form>
  );
}
