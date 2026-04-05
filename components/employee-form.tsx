"use client";

import type { FormEvent } from "react";

import type { Employee } from "../lib/api";

export type EmployeeFormValues = Omit<Employee, "id">;

type EmployeeFormProps = {
  title: string;
  eyebrow: string;
  submitLabel: string;
  error: string;
  form: EmployeeFormValues;
  saving: boolean;
  onChange: (field: keyof EmployeeFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function EmployeeForm({
  title,
  eyebrow,
  submitLabel,
  error,
  form,
  saving,
  onChange,
  onSubmit
}: EmployeeFormProps) {
  return (
    <article className="panel-card form-panel-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
      </div>

      <form className="data-form two-column-form" onSubmit={onSubmit}>
        <label>
          <span>Employee code</span>
          <input value={form.employeeCode} onChange={(event) => onChange("employeeCode", event.target.value)} required />
        </label>
        <label>
          <span>Full name</span>
          <input value={form.fullName} onChange={(event) => onChange("fullName", event.target.value)} required />
        </label>
        <label>
          <span>Department</span>
          <input value={form.department} onChange={(event) => onChange("department", event.target.value)} required />
        </label>
        <label>
          <span>Designation</span>
          <input value={form.designation} onChange={(event) => onChange("designation", event.target.value)} required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={form.email} onChange={(event) => onChange("email", event.target.value)} required />
        </label>
        <label>
          <span>Phone number</span>
          <input value={form.phoneNumber} onChange={(event) => onChange("phoneNumber", event.target.value)} required />
        </label>
        <label>
          <span>Joined date</span>
          <input type="date" value={form.joinedOn} onChange={(event) => onChange("joinedOn", event.target.value)} required />
        </label>

        {error ? <p className="form-error form-span-two">{error}</p> : null}

        <button className="primary-button form-span-two" type="submit" disabled={saving}>
          {saving ? "Saving employee..." : submitLabel}
        </button>
      </form>
    </article>
  );
}
