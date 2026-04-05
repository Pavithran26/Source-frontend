"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "../../components/app-shell";
import { EmptyState } from "../../components/empty-state";
import { SectionTabs } from "../../components/section-tabs";
import { StatsCard } from "../../components/stats-card";
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

  return (
    <AppShell
      active="attendance"
      heading="Attendance list"
      description="Use the dedicated list screen to review attendance in a full table view."
      userName={session.user.name}
      onLogout={handleLogout}
    >
      <SectionTabs tabs={attendanceTabs} />

      <section className="stats-grid">
        <StatsCard label="Present today" value={String(summary.todayPresent)} helper="Present, late, and remote combined" />
        <StatsCard label="Late arrivals" value={String(summary.lateArrivals)} helper="Employees marked late today" />
        <StatsCard label="Remote" value={String(summary.remoteEmployees)} helper="Employees working off-site today" />
        <StatsCard label="Attendance rate" value={`${summary.attendanceRate}%`} helper="Rate calculated from today's marked records" />
      </section>

      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Attendance log</p>
            <h3>{records.length} attendance entries</h3>
          </div>
          <div className="panel-actions">
            <Link className="primary-button" href="/attendance/mark">
              Mark attendance
            </Link>
          </div>
        </div>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        {records.length === 0 ? (
          <div className="empty-state-stack">
            <EmptyState
              title="No attendance saved yet"
              description="Use the mark attendance screen to add entries, then review them here in the table view."
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
