"use client"

import { HeaderProvider } from "@/contexts/HeaderContext"
import { ReactNode } from "react"

interface ClientHeaderProviderProps {
  children: ReactNode;
}

export function ClientHeaderProvider({ children }: ClientHeaderProviderProps) {
  return (
    <HeaderProvider>
      {children}
    </HeaderProvider>
  );
}