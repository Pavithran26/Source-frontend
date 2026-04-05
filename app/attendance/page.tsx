"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "../../components/app-shell";
import { EmptyState } from "../../components/empty-state";
import { SectionTabs } from "../../components/section-tabs";
import {
  getAttendanceRecords,
  getAttendanceSummary,
  type AttendanceRecord,
  type AttendanceSummary
} from "../../lib/api";
import { clearStoredSession } from "../../lib/session";
import { useProtectedSession } from "../../lib/use-protected-session";

const emptySummary: AttendanceSummary = {
  todayPresent: 0,
  lateArrivals: 0,
  remoteEmployees: 0,
  attendanceRate: 0
};

const attendanceTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/attendance", label: "Attendance list" },
  { href: "/attendance/mark", label: "Mark attendance" }
];

export default function AttendancePage() {
  const router = useRouter();
  const { loading, session } = useProtectedSession();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>(emptySummary);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!session) {
      return;
    }

    const loadAttendanceData = async () => {
      try {
        const [attendanceItems, summaryData] = await Promise.all([
          getAttendanceRecords(session.token),
          getAttendanceSummary(session.token)
        ]);

        setRecords(attendanceItems);
        setSummary(summaryData);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load attendance data");
      }
    };

    void loadAttendanceData();
  }, [session]);

  const handleLogout = () => {
    clearStoredSession();
    startTransition(() => router.replace("/"));
  };

  if (loading || !session) {
    return <main className="loading-screen">Checking your session...</main>;
  }

  const totalWorkedHours = records.reduce((sum, record) => sum + record.workedHours, 0);

  return (
    <AppShell
      active="attendance"
      heading="Attendance Register"
      description="Review crew presence, timings, and worked hours in one table-first view suited for daily operations."
      userName={session.user.name}
      userRole={session.user.role}
      action={
        <Link className="primary-button" href="/attendance/mark">
          Mark attendance
        </Link>
      }
      onLogout={handleLogout}
    >
      <SectionTabs tabs={attendanceTabs} />

      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Daily attendance</p>
            <h3>Attendance list</h3>
            <p className="panel-description">A single operational register for who came, when they checked in, and how long they worked.</p>
          </div>
        </div>

        <div className="insight-strip">
          <div className="insight-card">
            <span>Present today</span>
            <strong>{summary.todayPresent}</strong>
            <p>Marked available or working today</p>
          </div>
          <div className="insight-card">
            <span>Late / remote</span>
            <strong>
              {summary.lateArrivals} / {summary.remoteEmployees}
            </strong>
            <p>Special attendance states</p>
          </div>
          <div className="insight-card">
            <span>Worked hours</span>
            <strong>{totalWorkedHours.toFixed(1)}</strong>
            <p>Total recorded time in this register</p>
          </div>
          <div className="insight-card">
            <span>Attendance rate</span>
            <strong>{summary.attendanceRate}%</strong>
            <p>Percentage from today's attendance entries</p>
          </div>
        </div>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        {records.length === 0 ? (
          <div className="empty-state-stack">
            <EmptyState
              title="No attendance saved yet"
              description="Use the mark attendance screen to add daily entries, then review them here in the main operational register."
            />
            <Link className="secondary-button" href="/attendance/mark">
              Go to mark attendance
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Schedule</th>
                  <th>Hours</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employeeName}</strong>
                      <span>
                        {record.employeeCode} - {record.designation}
                      </span>
                    </td>
                    <td>{record.department}</td>
                    <td>
                      <span className={`status-chip status-${record.status}`}>{record.status}</span>
                    </td>
                    <td>
                      <strong>{record.checkIn}</strong>
                      <span>{record.checkOut ?? "Open shift"}</span>
                    </td>
                    <td>{record.workedHours.toFixed(1)}h</td>
                    <td>{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </AppShell>
  );
}
