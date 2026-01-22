import React, { useEffect, useMemo, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { useMangaStore } from '../../store/mangaStore';
import useAuthStore from '../../store/authStore';
import MangaCard from '../manga/MangaCard';
import Loading from '../common/Loading';

/**
 * CarruselRecomendaciones - Carrusel sencillo para mostrar recomendaciones personalizadas.
 * Este componente es intencionalmente didáctico y busca claridad antes que complejidad.
 */
function CarruselRecomendaciones({ titulo = 'Recomendaciones para ti', cantidad = 8, idSeccion = undefined }) {
  const {
    recommendations,
    loading,
    fetchRecommendations,
    fetchPersonalList,
    personalList,
  } = useMangaStore();
  const { isAuthenticated } = useAuthStore();
  const carruselRef = useRef(null);
  const hasRequestedRecommendations = useRef(false);
  const hasRequestedPersonalList = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasRequestedRecommendations.current = false;
      hasRequestedPersonalList.current = false;
      return;
    }

    // Obtener la lista personal por si el backend la usa para nutrir recomendaciones
    if (personalList.length === 0 && !hasRequestedPersonalList.current) {
      hasRequestedPersonalList.current = true;
      fetchPersonalList();
    }

    // Cargar recomendaciones cuando no existan
    const hasRecommendationsData = Array.isArray(recommendations?.recomendaciones)
      ? recommendations.recomendaciones.length > 0
      : Array.isArray(recommendations)
        ? recommendations.length > 0
        : false;

    if (hasRecommendationsData) {
      return;
    }

    if (!hasRequestedRecommendations.current) {
      hasRequestedRecommendations.current = true;
      fetchRecommendations(cantidad);
    }
  }, [
    isAuthenticated,
    recommendations,
    fetchRecommendations,
    cantidad,
    personalList.length,
    fetchPersonalList,
  ]);

  const listaRecomendaciones = useMemo(() => {
    if (!recommendations) return [];
    if (Array.isArray(recommendations.recomendaciones)) {
      return recommendations.recomendaciones.map(([manga]) => manga).filter(Boolean);
    }
    if (Array.isArray(recommendations)) {
      return recommendations;
    }
    return [];
  }, [recommendations]);

  const desplazamiento = () => {
    if (!carruselRef.current) return carruselRef.current?.clientWidth || 300;
    return carruselRef.current.clientWidth * 0.75;
  };

  const moverCarrusel = (direccion) => {
    if (!carruselRef.current) return;
    const distancia = desplazamiento();
    const offset = direccion === 'izquierda' ? -distancia : distancia;
    carruselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return (
      <section id={idSeccion} className="space-y-4">
        <div className="flex items-center space-x-3">
          <StarIcon className="h-7 w-7 text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-100">{titulo}</h2>
        </div>
        <p className="text-gray-400">
          Inicia sesión para recibir recomendaciones basadas en tus gustos.
        </p>
      </section>
    );
  }

  return (
    <section id={idSeccion} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StarIcon className="h-7 w-7 text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-100">{titulo}</h2>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            type="button"
            onClick={() => moverCarrusel('izquierda')}
            className="btn-secondary p-2"
            aria-label="Recomendaciones anteriores"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => moverCarrusel('derecha')}
            className="btn-secondary p-2"
            aria-label="Más recomendaciones"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && listaRecomendaciones.length === 0 ? (
        <Loading message="Buscando nuevas recomendaciones..." />
      ) : listaRecomendaciones.length === 0 ? (
        <p className="text-gray-400">
          Aún no hay recomendaciones disponibles. Agrega mangas a tu lista personal y califícalos para recibir sugerencias.
        </p>
      ) : (
        <>
          <div className="relative">
            <div
              ref={carruselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory"
            >
              {listaRecomendaciones.map((manga) => (
                <div
                  key={manga.id}
                  className="snap-start flex-none w-[220px] sm:w-[240px] lg:w-[260px]"
                >
                  <MangaCard manga={manga} />
                </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none hidden md:flex justify-between items-center">
              <div className="bg-gradient-to-r from-dark-900 via-dark-900/70 to-transparent w-16 h-full" />
              <div className="bg-gradient-to-l from-dark-900 via-dark-900/70 to-transparent w-16 h-full" />
            </div>
          </div>
          <p className="text-sm text-gray-500 md:hidden">
            Desliza hacia los lados para ver más recomendaciones.
          </p>
        </>
      )}
    </section>
  );
}

export default CarruselRecomendaciones;
