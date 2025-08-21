"use client"

console.log('📊 Metrics page module loaded');

import React from "react";

export default function MetricsPage() {
  console.log('🔄 MetricsPage component loaded');
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-6">PÁGINA DE MÉTRICAS CARGADA</h1>
      <p className="text-lg">Esta es una prueba para verificar que la página se está renderizando correctamente.</p>
      <p className="mt-4 text-gray-600">Si ves este mensaje, la ruta /product/metrics funciona correctamente.</p>
    </div>
  );
}
