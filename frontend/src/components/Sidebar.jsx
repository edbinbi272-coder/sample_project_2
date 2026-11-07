import React from "react";
import { BookHeart, BookOpen, Compass, LayoutDashboard, LibraryBig, LogIn, Plus, Star, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const discoverLinks = [{ to: "/", label: "Discover", icon: Compass }, { to: "/books", label: "Book collection", icon: LibraryBig }];
const personalLinks = [{ to: "/dashboard", label: "My dashboard", icon: LayoutDashboard }, { to: "/wishlist", label: "My wishlist", icon: BookHeart }, { to: "/my-reviews", label: "My reviews", icon: Star }];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <NavLink className="brand-lockup" to="/">
        <span className="brand-mark"><BookOpen size={23} strokeWidth={1.7} /></span>
        <span className="brand-words"><b>READERS</b><small>PARADISE</small></span>
      </NavLink>
      <div className="sidebar-rule" />
      <nav aria-label="Main navigation">
        <p className="nav-label">YOUR LIBRARY</p>
        {discoverLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}><Icon size={18} /><span>{label}</span></NavLink>)}
        <p className="nav-label nav-label-spaced">PERSONAL SPACE</p>
        {personalLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}><Icon size={18} /><span>{label}</span></NavLink>)}
        <NavLink to="/add-book" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}><Plus size={18} /><span>Add a book</span></NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}><UserRound size={18} /><span>My profile</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="reading-note"><BookOpen size={18} /><p>A room without books is like a body without a soul.</p><span>— Cicero</span></div>
        {user ? <div className="sidebar-user"><div className="avatar">{user.username.slice(0, 1).toUpperCase()}</div><div><b>{user.username}</b><small>Reader's account</small></div></div> : <NavLink className="nav-item" to="/login"><LogIn size={18} /><span>Sign in to your library</span></NavLink>}
      </div>
    </aside>
  );
}
