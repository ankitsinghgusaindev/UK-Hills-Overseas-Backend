import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Hills Overseas",
  description: "Authentic Himalayan products from Uttarakhand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}