import { Geist, Geist_Mono } from "next/font/google";
import { SWRProvider } from '@/components/SWRProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aplikasi Absensi",
  description: "Dibuat dengan Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRProvider>
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}
