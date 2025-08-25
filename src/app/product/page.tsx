'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/product/list');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-lg font-medium">Redirigiendo...</h2>
        <p className="text-muted-foreground">Selecciona un producto del menú superior para continuar.</p>
      </div>
    </div>
  )
}