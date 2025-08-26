// Server Component - se ejecuta en el servidor
import "../globals.css";

export default async function IndicatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
      <div className="min-h-full">
        {children}
      </div>
  );
}
