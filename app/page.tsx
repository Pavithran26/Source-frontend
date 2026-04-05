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
    <main className="login-shell login-shell-compact">
      <section className="login-panel form-panel">
        <div className="login-header">
          <h1>BSZone Admin</h1>
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
