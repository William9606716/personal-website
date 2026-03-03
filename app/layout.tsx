import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
      <body className={`${dmSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
