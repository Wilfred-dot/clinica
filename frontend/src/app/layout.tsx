import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "@/components/Toast";
import { ThemeProvider } from "next-themes";
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Clínica MMQ Oftalmologia",
  description: "Sistema de Gestão de Saúde Oftalmológica de Alta Performance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${dmSans.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}