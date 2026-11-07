import React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../services/api.js";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); setError("");
    if (form.password !== form.confirm_password) { setError("Your passwords do not match."); return; }
    if (form.password.length < 8) { setError("Choose a password with at least 8 characters."); return; }
    setBusy(true);
    try { await register(form); navigate("/login", { replace: true, state: { message: "Your account is ready. Sign in to begin." } }); }
    catch (err) { setError(getErrorMessage(err, "Unable to create your account.")); }
    finally { setBusy(false); }
  }
  return <section className="auth-card"><div className="auth-brand"><span><BookOpen size={21} /></span><b>READERS PARADISE</b></div><span className="eyebrow muted-eyebrow">JOIN OUR READING ROOM</span><h1>Make space for a story.</h1><p className="auth-intro">Create your account and start keeping track of the books you love.</p><AlertMessage>{error}</AlertMessage>
    <form className="stacked-form" onSubmit={handleSubmit}><label>Username<input autoComplete="username" minLength="3" maxLength="30" pattern="[A-Za-z0-9_]+" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="A name readers will know you by" /><small>3–30 letters, numbers, or underscores.</small></label><label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><div className="form-row"><label>Password<input type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label><label>Confirm password<input type="password" autoComplete="new-password" minLength="8" required value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} placeholder="Type it again" /></label></div><button className="button button-primary form-submit" disabled={busy}>{busy ? "Creating your account…" : "Create account"}<ArrowRight size={16} /></button></form>
    <p className="auth-switch">Already have a library? <Link to="/login">Sign in</Link></p>
  </section>;
}
