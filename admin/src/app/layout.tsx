import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Space - Admin Dashboard",
  description: "Manage users, resumes, and statistics for Resume Space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
