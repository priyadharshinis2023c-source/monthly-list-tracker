import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monthly List - Multi-Sheet Income & Expense Tracker",
  description:
    "Organize your finances across unlimited sheets. Track received & sent amounts (+ / -) with instant balance totals and monthly analytics charts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
