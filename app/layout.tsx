import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "William — CS & Economics at UC Berkeley",
  description:
    "Personal portfolio of William Peng, studying Computer Science and Economics at UC Berkeley. Open to internship opportunities.",
  openGraph: {
    title: "William — CS & Economics at UC Berkeley",
    description:
      "Personal portfolio of William Peng, studying Computer Science and Economics at UC Berkeley.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
