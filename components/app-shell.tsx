"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type AppShellProps = {
  active: "employees" | "attendance";
  heading: string;
  description: string;
  userName: string;
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({
  active,
  heading,
  description,
  userName,
  onLogout,
  children
}: AppShellProps) {
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="brand-block">
          <p className="brand-kicker">BSZone Admin</p>
          <h1>BSZone</h1>
          <p className="brand-copy">
            Capture your real employee master data first, then mark attendance from the same records.
          </p>
        </div>

        <nav className="workspace-nav">
          <Link className={active === "employees" ? "nav-link is-active" : "nav-link"} href="/employees">
            Employees
          </Link>
          <Link className={active === "attendance" ? "nav-link is-active" : "nav-link"} href="/attendance">
            Attendance
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="footer-label">Signed in as</p>
            <strong>{userName}</strong>
          </div>
          <button className="secondary-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <section className="workspace-content">
        <header className="content-hero">
          <p className="eyebrow">Operations dashboard</p>
          <h2>{heading}</h2>
          <p>{description}</p>
        </header>

        {children}
      </section>
    </main>
  );
}
