import { Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  title: "TrustChain",
  description: "Rebuilding trust in medicines with blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="bg-ink-950 text-slate-200 font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
