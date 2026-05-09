import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica MMQ Oftalmologia",
  description: "Sistema de Gestão de Saúde Oftalmológica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
