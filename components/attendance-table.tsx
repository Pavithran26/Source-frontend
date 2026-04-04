import type { AttendanceRecord } from "../lib/api";

type AttendanceTableProps = {
  records: AttendanceRecord[];
};

export function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <div className="table-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Live attendance records</h2>
        </div>
        <span className="pill">{records.length} records</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  <strong>{record.employeeName}</strong>
                  <span>{record.date}</span>
                </td>
                <td>{record.department}</td>
                <td>
                  <span className={`status status-${record.status}`}>{record.status}</span>
                </td>
                <td>{record.checkIn}</td>
                <td>{record.checkOut}</td>
                <td>{record.workedHours.toFixed(1)}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
