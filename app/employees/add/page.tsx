"use client";

import { startTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "../../../components/app-shell";
import { EmployeeForm, type EmployeeFormValues } from "../../../components/employee-form";
import { SectionTabs } from "../../../components/section-tabs";
import { createEmployee } from "../../../lib/api";
import { clearStoredSession } from "../../../lib/session";
import { useProtectedSession } from "../../../lib/use-protected-session";

const employeeTabs = [
  { href: "/employees", label: "Employee list" },
  { href: "/employees/add", label: "Add employee" }
];

const initialForm: EmployeeFormValues = {
  employeeCode: "",
  fullName: "",
  department: "",
  designation: "",
  email: "",
  phoneNumber: "",
  joinedOn: ""
};

export default function AddEmployeePage() {
  const router = useRouter();
  const { loading, session } = useProtectedSession();
  const [form, setForm] = useState<EmployeeFormValues>(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof EmployeeFormValues, value: string) => {
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
      await createEmployee(session.token, form);
      startTransition(() => router.replace("/employees"));
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
      heading="Add employee"
      description="Use the dedicated form screen to create a new employee record."
      userName={session.user.name}
      onLogout={handleLogout}
    >
      <SectionTabs tabs={employeeTabs} />
      <EmployeeForm
        eyebrow="Create employee"
        title="Basic required details"
        submitLabel="Save employee"
        error={formError}
        form={form}
        saving={saving}
        onChange={updateField}
        onSubmit={handleSubmit}
      />
    </AppShell>
  );
}
