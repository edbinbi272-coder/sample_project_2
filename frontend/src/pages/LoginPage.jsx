import React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../services/api.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice] = useState(location.state?.message || "");
  const [form, setForm] = useState({ username_or_email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await login(form.username_or_email, form.password); navigate(location.state?.from || "/dashboard", { replace: true }); }
    catch (err) { setError(getErrorMessage(err, "Unable to sign in.")); }
    finally { setBusy(false); }
  }
  return <section className="auth-card"><div className="auth-brand"><span><BookOpen size={21} /></span><b>READERS PARADISE</b></div><span className="eyebrow muted-eyebrow">WELCOME BACK</span><h1>Your next chapter awaits.</h1><p className="auth-intro">Sign in to pick up where your reading journey left off.</p><AlertMessage tone="success">{notice}</AlertMessage><AlertMessage>{error}</AlertMessage>
    <form className="stacked-form" onSubmit={handleSubmit}><label>Email or username<input autoComplete="username" required value={form.username_or_email} onChange={(e) => setForm({ ...form, username_or_email: e.target.value })} placeholder="Your reader name" /></label><label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></label><button className="button button-primary form-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to your library"}<ArrowRight size={16} /></button></form>
    <p className="auth-switch">New to Readers Paradise? <Link to="/register">Create your account</Link></p>
  </section>;
}
