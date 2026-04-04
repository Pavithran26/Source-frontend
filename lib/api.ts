export type AttendanceSummary = {
  todayPresent: number;
  lateArrivals: number;
  remoteEmployees: number;
  attendanceRate: number;
};

export type AttendanceRecord = {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  status: string;
  workedHours: number;
  checkIn: string;
  checkOut: string;
  notes?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

async function fetchJson<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  } catch {
    if (path.includes("/summary")) {
      return {
        todayPresent: 0,
        lateArrivals: 0,
        remoteEmployees: 0,
        attendanceRate: 0
      } as T;
    }

    return [] as T;
  }
}

export const getAttendanceSummary = () => fetchJson<AttendanceSummary>("/attendance/summary");
export const getAttendanceRecords = () => fetchJson<AttendanceRecord[]>("/attendance/records");
