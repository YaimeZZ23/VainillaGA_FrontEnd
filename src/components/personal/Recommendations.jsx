import React from 'react';
import CarruselRecomendaciones from './CarruselRecomendaciones';

/**
 * Componente Recommendations - ahora actúa como un envoltorio sencillo
 * para mantener compatibilidad en las rutas existentes.
 */
function Recommendations() {
  return (
    <div className="space-y-6">
      <CarruselRecomendaciones titulo="Recomendaciones personalizadas" cantidad={6}/>
    </div>
  );
}

export default Recommendations;