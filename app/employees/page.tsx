"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "../../components/app-shell";
import { EmptyState } from "../../components/empty-state";
import { createEmployee, getEmployees, type Employee } from "../../lib/api";
import { clearStoredSession } from "../../lib/session";
import { useProtectedSession } from "../../lib/use-protected-session";

const initialForm = {
  employeeCode: "",
  fullName: "",
  department: "",
  designation: "",
  email: "",
  phoneNumber: "",
  joinedOn: ""
};

export default function EmployeesPage() {
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
        const items = await getEmployees(session.token);
        setEmployees(items);
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
      const created = await createEmployee(session.token, form);
      setEmployees((current) => [created, ...current]);
      setForm(initialForm);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save employee");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return <main className="loading-screen">Checking your session...</main>;
  }

  return (
    <AppShell
      active="employees"
      heading="Employee registry"
      description="Add the basic employee details you want to maintain. The attendance screen will use only these saved employees."
      userName={session.user.name}
      onLogout={handleLogout}
    >
      <section className="content-grid">
        <article className="panel-card form-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Create employee</p>
              <h3>Basic required details</h3>
            </div>
          </div>

          <form className="data-form two-column-form" onSubmit={handleSubmit}>
            <label>
              <span>Employee code</span>
              <input value={form.employeeCode} onChange={(event) => updateField("employeeCode", event.target.value)} required />
            </label>
            <label>
              <span>Full name</span>
              <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} required />
            </label>
            <label>
              <span>Department</span>
              <input value={form.department} onChange={(event) => updateField("department", event.target.value)} required />
            </label>
            <label>
              <span>Designation</span>
              <input value={form.designation} onChange={(event) => updateField("designation", event.target.value)} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
            </label>
            <label>
              <span>Phone number</span>
              <input value={form.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} required />
            </label>
            <label>
              <span>Joined date</span>
              <input type="date" value={form.joinedOn} onChange={(event) => updateField("joinedOn", event.target.value)} required />
            </label>

            {formError ? <p className="form-error form-span-two">{formError}</p> : null}

            <button className="primary-button form-span-two" type="submit" disabled={saving}>
              {saving ? "Saving employee..." : "Add employee"}
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Employee list</p>
              <h3>{employees.length} employees saved</h3>
            </div>
          </div>

          {pageError ? <p className="form-error">{pageError}</p> : null}

          {employees.length === 0 ? (
            <EmptyState
              title="No employees added yet"
              description="Add your first employee from the form on the left. Attendance marking will become available after that."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Contact</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <strong>{employee.fullName}</strong>
                        <span>{employee.employeeCode}</span>
                      </td>
                      <td>{employee.department}</td>
                      <td>{employee.designation}</td>
                      <td>
                        <strong>{employee.email}</strong>
                        <span>{employee.phoneNumber}</span>
                      </td>
                      <td>{employee.joinedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}
