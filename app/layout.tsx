import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Attendance Platform",
  description: "Web dashboard for attendance operations"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
