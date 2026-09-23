// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisionFlow | WhatsApp Automation for Eye Clinics",
  description:
    "Appointment booking, reminders, follow-ups and optical alerts for eye clinics through WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}