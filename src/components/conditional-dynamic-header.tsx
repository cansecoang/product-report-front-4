"use client"

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { DynamicPageHeader } from "./dynamic-page-header";

export function ConditionalDynamicHeader() {
  const pathname = usePathname();
  const [shouldShowHeader, setShouldShowHeader] = useState(true);
  
  useEffect(() => {
    // Solo ocultar el header en la ruta raíz /product
    setShouldShowHeader(pathname !== '/product');
  }, [pathname]);
  
  // Durante la hidratación, mostrar el header para evitar mismatch
  // Después del mounting, useEffect determinará si debe mostrarse o no
  if (!shouldShowHeader) {
    return null;
  }
  
  return <DynamicPageHeader />;
}