import React from 'react';

// Componente Loading - Indicador de carga
// Muestra un spinner animado mientras se cargan los datos
// Parámetro: message (string) es el mensaje opcional a mostrar
function Loading({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Spinner animado */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}

export default Loading;