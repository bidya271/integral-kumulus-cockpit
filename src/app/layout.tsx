import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kumulus | Lena's Morning Claims Dispatch Cockpit",
  description: "Autonomous & Human-in-the-Loop AI Claims Dispatch Engine for Munich Hailstorm Catastrophe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
