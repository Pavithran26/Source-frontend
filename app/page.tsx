"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { login } from "../lib/api";
import { getStoredSession, isSessionExpired, setStoredSession } from "../lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("Pavithran26");
  const [password, setPassword] = useState("@Pavi4624");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getStoredSession();

    if (session && !isSessionExpired(session)) {
      startTransition(() => router.replace("/employees"));
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const session = await login({ username, password });
      setStoredSession(session);
      startTransition(() => router.replace("/employees"));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-panel intro-panel">
        <p className="eyebrow">BSZone workspace</p>
        <h1>Manage employees first. Track attendance from the same live records.</h1>
        <p>
          This admin console is designed for manual entry. No sample employees or sample attendance rows are shown.
        </p>
        <div className="intro-notes">
          <div>
            <span>Employees</span>
            <strong>Basic required profile capture</strong>
          </div>
          <div>
            <span>Attendance</span>
            <strong>Marks only against saved employees</strong>
          </div>
          <div>
            <span>Security</span>
            <strong>Credentials validated against the database</strong>
          </div>
        </div>
      </section>

      <section className="login-panel form-panel">
        <div className="login-header">
          <p className="eyebrow">Admin login</p>
          <h2>Sign in to continue</h2>
          <p>Only the configured database credential is allowed.</p>
        </div>

        <form className="data-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
