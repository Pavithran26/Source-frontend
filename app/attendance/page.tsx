import { AttendanceTable } from "../../components/attendance-table";
import { Header } from "../../components/header";
import { StatsCard } from "../../components/stats-card";
import { getAttendanceRecords, getAttendanceSummary } from "../../lib/api";

export default async function AttendancePage() {
  const [summary, records] = await Promise.all([
    getAttendanceSummary(),
    getAttendanceRecords()
  ]);

  return (
    <main className="page-shell">
      <Header
        title="Attendance overview"
        subtitle="Monitor check-ins, late arrivals, and remote activity across your organization from one place."
      />

      <section className="stats-grid">
        <StatsCard label="Present today" value={String(summary.todayPresent)} helper="Employees marked present, late, or remote" />
        <StatsCard label="Late arrivals" value={String(summary.lateArrivals)} helper="People who checked in after the start window" />
        <StatsCard label="Remote" value={String(summary.remoteEmployees)} helper="Team members currently working off-site" />
        <StatsCard label="Attendance rate" value={`${summary.attendanceRate}%`} helper="Real-time attendance completion" />
      </section>

      <AttendanceTable records={records} />
    </main>
  );
}
