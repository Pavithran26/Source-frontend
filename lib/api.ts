export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  expiresAt: string;
};

export type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  email: string;
  phoneNumber: string;
  joinedOn: string;
};

export type AttendanceSummary = {
  todayPresent: number;
  lateArrivals: number;
  remoteEmployees: number;
  attendanceRate: number;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  date: string;
  status: "present" | "late" | "remote" | "absent";
  workedHours: number;
  checkIn: string;
  checkOut: string | null;
  notes?: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function parsePayload(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as ApiEnvelope<unknown> | { message?: string };
  } catch {
    return null;
  }
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:4000/api"
    : "https://source-backend-django.vercel.app/api");

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const raw = await response.text();
  const payload = parsePayload(raw);

  if (!response.ok) {
    const message =
      payload && "message" in payload && payload.message
        ? payload.message
        : raw.trim().startsWith("<")
          ? `Request failed (${response.status})`
          : raw || "Request failed";

    throw new Error(message);
  }

  if (!payload || !("data" in payload)) {
    throw new Error("Invalid server response");
  }

  return (payload as ApiEnvelope<T>).data;
}

export const login = (input: { username: string; password: string }) =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });

export const getSessionUser = (token: string) =>
  request<{ user: AuthUser }>("/auth/me", undefined, token);

export const getEmployees = (token: string) => request<Employee[]>("/employees", undefined, token);

export const createEmployee = (token: string, input: Omit<Employee, "id">) =>
  request<Employee>(
    "/employees",
    {
      method: "POST",
      body: JSON.stringify(input)
    },
    token
  );

export const getEmployee = (token: string, id: string) => request<Employee>(`/employees/${id}`, undefined, token);

export const updateEmployee = (token: string, id: string, input: Omit<Employee, "id">) =>
  request<Employee>(
    `/employees/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input)
    },
    token
  );

export const deleteEmployee = (token: string, id: string) =>
  request<{ id: string }>(
    `/employees/${id}`,
    {
      method: "DELETE"
    },
    token
  );

export const getAttendanceSummary = (token: string) =>
  request<AttendanceSummary>("/attendance/summary", undefined, token);

export const getAttendanceRecords = (token: string) =>
  request<AttendanceRecord[]>("/attendance/records", undefined, token);

export const createAttendance = (
  token: string,
  input: {
    employeeId: string;
    date: string;
    status: AttendanceRecord["status"];
    checkIn: string;
    checkOut?: string;
    workedHours: number;
    notes?: string;
  }
) =>
  request<AttendanceRecord>(
    "/attendance/mark",
    {
      method: "POST",
      body: JSON.stringify(input)
    },
    token
  );
