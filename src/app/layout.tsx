import { Inter } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { ThemeInitScript } from "@/components/theme-init-script";
import { rootMetadata } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeInitScript />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
