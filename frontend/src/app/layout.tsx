import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "SparkLive | Find Your Spark",
  description: "Discover people, chat privately, go live, and send virtual gifts.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
