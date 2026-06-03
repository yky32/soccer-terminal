import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { ThemeInitScript } from "@/components/theme-init-script";
import { PRODUCT_NAME, TITLE_TEMPLATE } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: PRODUCT_NAME,
    template: TITLE_TEMPLATE,
  },
  description:
    "Professional soccer intelligence — global live map, leagues, and match insights.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

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
