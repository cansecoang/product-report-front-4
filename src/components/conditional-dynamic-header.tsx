"use client"

import { useState, useEffect } from "react";
import { DynamicPageHeader } from "./dynamic-page-header";

interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface ConditionalDynamicHeaderProps {
  workPackages?: WorkPackage[];
}

export function ConditionalDynamicHeader({ workPackages = [] }: ConditionalDynamicHeaderProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Marcar que estamos en el cliente para evitar hydration mismatch
    setIsClient(true);
  }, []);
  
  // Durante SSR y antes de que se complete la hidratación, mostrar el header básico
  if (!isClient) {
    return <DynamicPageHeader workPackages={workPackages} />;
  }

  // Siempre mostrar el header, incluyendo en /product
  return <DynamicPageHeader workPackages={workPackages} />;
}