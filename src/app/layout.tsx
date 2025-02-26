import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const myFont = localFont({
  src: "./Formula1-Regular.otf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoolClub F1 Predictions",
  description:
    "Set your predictions before each race for the top 5 drivers, and we will see who gets the most points in the end of the season.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${myFont.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
