"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "../../components/app-shell";
import { ModuleGrid } from "../../components/module-grid";
import { StatsCard } from "../../components/stats-card";
import { getAttendanceRecords, getAttendanceSummary, getEmployees, type AttendanceRecord, type AttendanceSummary, type Employee } from "../../lib/api";
import { clearStoredSession } from "../../lib/session";
import { useProtectedSession } from "../../lib/use-protected-session";

const emptySummary: AttendanceSummary = {
  todayPresent: 0,
  lateArrivals: 0,
  remoteEmployees: 0,
  attendanceRate: 0
};

const moduleItems = [
  {
    title: "Employee Master",
    description: "Manage worker records, crew contacts, and department details.",
    icon: "employee" as const,
    href: "/employees"
  },
  {
    title: "Attendance Register",
    description: "Track daily crew presence and check-in status from one place.",
    icon: "attendance" as const,
    href: "/attendance"
  },
  {
    title: "Add Employee",
    description: "Register new field staff before sending them for work.",
    icon: "employee" as const,
    href: "/employees/add"
  },
  {
    title: "Mark Attendance",
    description: "Capture today's attendance directly against saved employees.",
    icon: "attendance" as const,
    href: "/attendance/mark"
  },
  {
    title: "Land Ledger",
    description: "Owner details, lease periods, and tree count registry.",
    icon: "land" as const,
    status: "planned" as const
  },
  {
    title: "Harvest Work Log",
    description: "Land-wise coconut count, crew assignment, and output tracking.",
    icon: "workflow" as const,
    status: "planned" as const
  },
  {
    title: "Vehicle Desk",
    description: "Transport usage, fuel movement, and dispatch coordination.",
    icon: "vehicle" as const,
    status: "planned" as const
  },
  {
    title: "Sales and Expenses",
    description: "Buyer billing, transport spend, wages, and profit view.",
    icon: "sales" as const,
    status: "planned" as const
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const { loading, session } = useProtectedSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>(emptySummary);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!session) {
      return;
    }

    const loadDashboard = async () => {
      try {
        const [employeeItems, attendanceItems, summaryData] = await Promise.all([
          getEmployees(session.token),
          getAttendanceRecords(session.token),
          getAttendanceSummary(session.token)
        ]);

        setEmployees(employeeItems);
        setRecords(attendanceItems);
        setSummary(summaryData);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load dashboard");
      }
    };

    void loadDashboard();
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
      active="dashboard"
      heading="Dashboard"
      description="One operating view for lease lands, field workers, attendance, transport planning, and future sales tracking."
      userName={session.user.name}
      userRole={session.user.role}
      action={
        <Link className="primary-button" href="/attendance/mark">
          Record today&apos;s attendance
        </Link>
      }
      onLogout={handleLogout}
    >
      <section className="stats-grid">
        <StatsCard helper="Employees ready for deployment" icon="employee" label="Crew strength" value={String(employees.length)} />
        <StatsCard helper="Entries captured for the day" icon="attendance" label="Attendance entries" value={String(records.length)} />
        <StatsCard helper="Based on today's attendance marks" icon="reports" label="Presence rate" value={`${summary.attendanceRate}%`} />
        <StatsCard helper="Total hours from recorded shifts" icon="workflow" label="Worked hours" value={totalWorkedHours.toFixed(1)} />
      </section>

      <section className="content-grid dashboard-grid">
        <article className="panel-card dashboard-primary">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Master quick links</p>
              <h3>Operations workspace</h3>
              <p className="panel-description">
                Built to feel like an ERP, with live modules first and the next business modules already mapped.
              </p>
            </div>
          </div>

          {pageError ? <p className="form-error">{pageError}</p> : null}

          <ModuleGrid items={moduleItems} />
        </article>

        <article className="panel-card dashboard-flow">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Business flow</p>
              <h3>How this ERP fits your work</h3>
            </div>
          </div>

          <div className="flow-list">
            <div className="flow-list-item">
              <span className="flow-item-icon">1</span>
              <div>
                <strong>Lease land register</strong>
                <p>Capture land owner details, gudhagai amount, lease period, and tree count.</p>
              </div>
            </div>
            <div className="flow-list-item">
              <span className="flow-item-icon">2</span>
              <div>
                <strong>Deploy workers and mark attendance</strong>
                <p>Use employee master and attendance to track which field crew went to work each day.</p>
              </div>
            </div>
            <div className="flow-list-item">
              <span className="flow-item-icon">3</span>
              <div>
                <strong>Track harvest, transport, sales, and profit</strong>
                <p>The next modules will join work log, vehicle, sales, and expenses into one profit view.</p>
              </div>
            </div>
          </div>

          <div className="dashboard-note">
            <strong>Ready now</strong>
            <p>
              Employee master and attendance are already live. The UI is now aligned for the larger coconut business system you described.
            </p>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
