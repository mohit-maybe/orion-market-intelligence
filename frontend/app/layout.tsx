import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORION — Adaptive Market Intelligence",
  description: "Research-first AI market intelligence and paper trading terminal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
