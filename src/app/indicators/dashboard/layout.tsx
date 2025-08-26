import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard de Indicadores - OroVerde",
  description: "Análisis y métricas de indicadores",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
