import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apsen SD",
  description: "Sistem Absensi SD",
  icons: {
    icon: "/logo-sd.png",
    shortcut: "/logo-sd.png",
    apple: "/logo-sd.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
