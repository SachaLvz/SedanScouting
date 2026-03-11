import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mbarodi FC — Scouting",
  description: "Plateforme de scouting et détection Mbarodi FC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
