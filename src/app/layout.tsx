import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budgeting Mahes",
  description: "Aplikasi pencatatan keuangan pribadi mahasiswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}