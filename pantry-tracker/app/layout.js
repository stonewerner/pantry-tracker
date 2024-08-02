'use client'
import { Inter } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

//removed this export bc client
const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
