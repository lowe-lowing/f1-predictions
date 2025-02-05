import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const myFont = localFont({
  src: './Formula1-Regular.otf',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${myFont.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</ThemeProvider>
      </body>
    </html>
  );
}
