"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "../../../components/app-shell";
import { EmptyState } from "../../../components/empty-state";
import { SectionTabs } from "../../../components/section-tabs";
import { createAttendance, getEmployees, type AttendanceRecord, type Employee } from "../../../lib/api";
import { clearStoredSession } from "../../../lib/session";
import { useProtectedSession } from "../../../lib/use-protected-session";

const attendanceTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/attendance", label: "Attendance list" },
  { href: "/attendance/mark", label: "Mark attendance" }
];

const initialForm = {
  employeeId: "",
  date: "",
  status: "present" as AttendanceRecord["status"],
  checkIn: "",
  checkOut: "",
  workedHours: "0",
  notes: ""
};

export default function MarkAttendancePage() {
  const router = useRouter();
  const { loading, session } = useProtectedSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(initialForm);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }

    const loadEmployees = async () => {
      try {
        setEmployees(await getEmployees(session.token));
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load employees");
      }
    };

    void loadEmployees();
  }, [session]);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogout = () => {
    clearStoredSession();
    startTransition(() => router.replace("/"));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await createAttendance(session.token, {
        employeeId: form.employeeId,
        date: form.date,
        status: form.status,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        workedHours: Number(form.workedHours),
        notes: form.notes
      });

      startTransition(() => router.replace("/attendance"));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return <main className="loading-screen">Checking your session...</main>;
  }

  return (
    <AppShell
      active="attendance"
      heading="Mark Attendance"
      description="Capture crew attendance in a fast input screen built for daily field office use."
      userName={session.user.name}
      userRole={session.user.role}
      onLogout={handleLogout}
    >
      <SectionTabs tabs={attendanceTabs} />

      <article className="panel-card form-panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Mark attendance</p>
            <h3>Record attendance from employee list</h3>
            <p className="panel-description">
              Choose a saved worker, capture timing, and keep the daily register accurate.
            </p>
          </div>
        </div>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        {employees.length === 0 ? (
          <div className="empty-state-stack">
            <EmptyState
              title="Add employees before marking attendance"
              description="Create at least one employee first, then come back here to mark attendance."
            />
            <Link className="secondary-button" href="/employees/add">
              Go to add employee
            </Link>
          </div>
        ) : (
          <>
            <div className="insight-strip form-insight-strip">
              <div className="insight-card">
                <span>Employees available</span>
                <strong>{employees.length}</strong>
                <p>Workers ready for attendance entry</p>
              </div>
              <div className="insight-card">
                <span>Recommended flow</span>
                <strong>Check-in first</strong>
                <p>Capture date, time, and status in one go</p>
              </div>
              <div className="insight-card">
                <span>Operational use</span>
                <strong>Daily</strong>
                <p>Best used as soon as crews start work</p>
              </div>
            </div>

            <form className="data-form two-column-form" onSubmit={handleSubmit}>
              <label className="form-span-two">
                <span>Employee</span>
                <select value={form.employeeId} onChange={(event) => updateField("employeeId", event.target.value)} required>
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName} ({employee.employeeCode})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Date</span>
                <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} required />
              </label>

              <label>
                <span>Status</span>
                <select value={form.status} onChange={(event) => updateField("status", event.target.value)} required>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="remote">Remote</option>
                  <option value="absent">Absent</option>
                </select>
              </label>

              <label>
                <span>Check-in time</span>
                <input type="time" value={form.checkIn} onChange={(event) => updateField("checkIn", event.target.value)} required />
              </label>

              <label>
                <span>Check-out time</span>
                <input type="time" value={form.checkOut} onChange={(event) => updateField("checkOut", event.target.value)} />
              </label>

              <label>
                <span>Worked hours</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={form.workedHours}
                  onChange={(event) => updateField("workedHours", event.target.value)}
                  required
                />
              </label>

              <label className="form-span-two">
                <span>Notes</span>
                <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} />
              </label>

              {formError ? <p className="form-error form-span-two">{formError}</p> : null}

              <button className="primary-button form-span-two" type="submit" disabled={saving}>
                {saving ? "Saving attendance..." : "Save attendance"}
              </button>
            </form>
          </>
        )}
      </article>
    </AppShell>
  );
}
