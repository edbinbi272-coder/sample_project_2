import React from "react";
import { CalendarDays, LogOut, Mail, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  return <section className="page-section narrow-page"><span className="eyebrow muted-eyebrow">YOUR ACCOUNT</span><h1>Your reader profile.</h1><p className="page-intro">A little home for your Readers Paradise account.</p><article className="profile-card"><div className="profile-hero"><span className="profile-avatar">{user?.username.slice(0, 1).toUpperCase()}</span><div><h2>{user?.username}</h2><p>Reader since {new Date(user?.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p></div></div><div className="profile-details"><div><span><UserRound size={16} /> Username</span><b>{user?.username}</b></div><div><span><Mail size={16} /> Email address</span><b>{user?.email}</b></div><div><span><CalendarDays size={16} /> Joined</span><b>{new Date(user?.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</b></div></div><div className="profile-links"><Link className="button button-outline" to="/dashboard">Visit my dashboard</Link><button className="button button-quiet danger-text" onClick={logout}><LogOut size={16} /> Sign out</button></div></article></section>;
}
