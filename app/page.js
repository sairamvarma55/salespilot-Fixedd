'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

let supabase;

function sb() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
  }
  return supabase;
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [leads, setLeads] = useState([]);
  const [leadName, setLeadName] = useState('');
  const [company, setCompany] = useState('');
  const [product, setProduct] = useState('');
  const [conversation, setConversation] = useState('');
  const [goal, setGoal] = useState('Get a reply');
  const [tone, setTone] = useState('Professional and friendly');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const s = sb();

    s.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = s.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadLeads();
    } else {
      setLeads([]);
    }
  }, [session]);

  async function loadLeads() {
    const { data } = await sb()
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    setLeads(data || []);
  }

  async function authSubmit(e) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthMessage('');

    const r =
      authMode === 'login'
        ? await sb().auth.signInWithPassword({ email, password })
        : await sb().auth.signUp({ email, password });

    setAuthBusy(false);

    if (r.error) {
      setAuthMessage(r.error.message);
    } else if (authMode === 'signup') {
      setAuthMessage(
        'Account created. Check your email if confirmation is required, then sign in.'
      );
    }
  }

  async function signOut() {
    await sb().auth.signOut();
    setResult('');
  }

  async function generate() {
    setBusy(true);
    setNotice('');
    setResult('');

    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName,
          company,
          product,
          conversation,
          goal,
          tone,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Generation failed.');
      }

      setResult(d.message || '');

      if (d.mode === 'demo') {
        setNotice(
          'Demo mode is active. Add your OpenAI key in Vercel to enable live AI.'
        );
      }
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveLead() {
    if (!result) {
      setNotice('Generate a message first.');
      return;
    }

    setSaveBusy(true);
    setNotice('');

    const { error } = await sb()
      .from('leads')
      .insert({
        user_id: session.user.id,
        lead_name: leadName,
        company,
        product,
        goal,
        tone,
        conversation,
        message: result,
      });

    setSaveBusy(false);

    if (error) {
      setNotice(error.message);
    } else {
      setNotice('Lead saved successfully.');
      loadLeads();
    }
  }

  async function checkout() {
    const r = await fetch('/api/checkout', {
      method: 'POST',
    });

    const d = await r.json();

    if (d.url) {
      window.location.href = d.url;
    } else {
      setNotice(d.error || 'Checkout unavailable.');
    }
  }

  if (!session) {
    return (
      <>
        <header className="topbar">
          <div className="brand">
            SalesPilot <span>AI</span>
          </div>

          <button className="upgrade" onClick={checkout}>
            Upgrade Pro · $19/mo
          </button>
        </header>

        <main className="auth card">
          <h2>
            {authMode === 'login'
              ? 'Welcome back'
              : 'Create your SalesPilot account'}
          </h2>

          <p className="muted">
            Sign in to save your leads and follow-ups.
          </p>

          {authMessage && (
            <div className="notice error">{authMessage}</div>
          )}

          <form onSubmit={authSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <button
              className="btn btn-primary"
              disabled={authBusy}
            >
              {authBusy
                ? 'Please wait…'
                : authMode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}

            <button
              className="linkbtn"
              onClick={() => {
                setAuthMode(
                  authMode === 'login' ? 'signup' : 'login'
                );
                setAuthMessage('');
              }}
            >
              {authMode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          SalesPilot <span>AI</span>
        </div>

        <div className="top-actions">
          <span className="user-pill">{session.user.email}</span>

          <button className="btn btn-light" onClick={signOut}>
            Sign out
          </button>

          <button className="upgrade" onClick={checkout}>
            Upgrade Pro · $19/mo
          </button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <h1>Your AI sales co-pilot</h1>
          <p>
            Turn leads and conversations into better follow-ups in seconds.
          </p>
        </section>

        {notice && <div className="notice">{notice}</div>}

        <div className="grid">
          <section className="card">
            <h2>Generate follow-up</h2>

            <div className="row">
              <div className="field">
                <label>Lead name</label>
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Sarah"
                />
              </div>

              <div className="field">
                <label>Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ABC Supermarket"
                />
              </div>
            </div>

            <div className="field">
              <label>Product / service</label>
              <input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Premium coffee beans"
              />
            </div>

            <div className="row">
              <div className="field">
                <label>Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option>Get a reply</option>
                  <option>Book a meeting</option>
                  <option>Follow up on proposal</option>
                  <option>Close the deal</option>
                </select>
              </div>

              <div className="field">
                <label>Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional and friendly</option>
                  <option>Short and direct</option>
                  <option>Warm and casual</option>
                  <option>Confident</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Previous conversation</label>
              <textarea
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                placeholder="They said they would review the offer next week."
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={generate}
              disabled={busy || !leadName || !product}
            >
              {busy ? 'Generating…' : 'Generate follow-up'}
            </button>
          </section>

          <section className="card">
            <h2>Your message</h2>

            <div className="result">
              {result ||
                'Your personalized follow-up will appear here.'}
            </div>

            <div className="actions">
              <button
                className="btn btn-light"
                onClick={() =>
                  navigator.clipboard?.writeText(result)
                }
                disabled={!result}
              >
                Copy
              </button>

              <button
                className="btn btn-primary"
                onClick={saveLead}
                disabled={!result || saveBusy}
              >
                {saveBusy ? 'Saving…' : 'Save lead'}
              </button>
            </div>
          </section>
        </div>

        <section className="card leads">
          <h2>Saved leads</h2>

          {leads.length === 0 ? (
            <p className="muted">
              No saved leads yet. Generate a follow-up and click
              “Save lead”.
            </p>
          ) : (
            leads.map((l) => (
              <div className="lead-item" key={l.id}>
                <div className="lead-head">
                  <div className="lead-title">
                    {l.lead_name}
                    {l.company ? ` · ${l.company}` : ''}
                  </div>

                  <div className="lead-date">
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="small muted">
                  {l.product} · {l.goal}
                </div>

                <div className="lead-msg">{l.message}</div>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
