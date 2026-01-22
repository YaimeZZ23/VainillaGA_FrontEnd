import React, { useEffect, useMemo, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMangaStore } from '../../store/mangaStore';
import useAuthStore from '../../store/authStore';
import MangaCard from './MangaCard';
import Loading from '../common/Loading';

function obtenerTimestampActualizacion(manga) {
  if (!manga) return Number.NEGATIVE_INFINITY;
  const fechaReferencia = manga.fecha_actualizacion || manga.fecha_ultima_actualizacion || manga.fecha_creacion;
  if (!fechaReferencia) {
    return Number.NEGATIVE_INFINITY;
  }
  const timestamp = new Date(fechaReferencia).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function CarruselMangasRecientes({ titulo = 'Últimos mangas actualizados', idSeccion = undefined, limite = 10 }) {
  const { mangas, loading, fetchMangas } = useMangaStore();
  const { isAuthenticated } = useAuthStore();
  const carruselRef = useRef(null);

  useEffect(() => {
    if (mangas.length === 0) {
      fetchMangas();
    }
  }, [mangas.length, fetchMangas]);

  const mangasRecientes = useMemo(() => {
    if (!Array.isArray(mangas) || mangas.length === 0) {
      return [];
    }

    const ordenados = [...mangas]
      .sort((a, b) => obtenerTimestampActualizacion(b) - obtenerTimestampActualizacion(a))
      .filter((manga) => obtenerTimestampActualizacion(manga) !== Number.NEGATIVE_INFINITY);

    return ordenados.slice(0, limite);
  }, [mangas, limite]);

  const desplazar = (direccion) => {
    if (!carruselRef.current) return;

    const contenedor = carruselRef.current;
    const distancia = contenedor.clientWidth * 0.75;
    const desplazamiento = direccion === 'izquierda' ? -distancia : distancia;

    contenedor.scrollBy({ left: desplazamiento, behavior: 'smooth' });
  };

  return (
    <section id={idSeccion} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">{titulo}</h2>
        {mangasRecientes.length > 0 && (
          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={() => desplazar('izquierda')}
              className="btn-secondary p-2"
              aria-label="Ver mangas anteriores"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => desplazar('derecha')}
              className="btn-secondary p-2"
              aria-label="Ver más mangas"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {loading && mangasRecientes.length === 0 ? (
        <Loading message="Cargando mangas recientes..." />
      ) : mangasRecientes.length === 0 ? (
        <p className="text-gray-400">Aún no hay mangas con actualizaciones recientes.</p>
      ) : (
        <>
          <div className="relative">
            <div
              ref={carruselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory"
            >
              {mangasRecientes.map((manga) => (
                <div
                  key={manga.id}
                  className="snap-start min-w-[220px] sm:min-w-[240px] lg:min-w-[260px]"
                >
                  <MangaCard manga={manga} />
                </div>
              ))}
            </div>
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none hidden md:flex justify-between items-center">
              <div className="bg-gradient-to-r from-dark-900/80 via-dark-900/25 to-transparent w-16 h-full" />
              <div className="bg-gradient-to-l from-dark-900/80 via-dark-900/25 to-transparent w-16 h-full" />
            </div>
          </div>
          {!isAuthenticated && (
            <p className="text-sm text-gray-500">
              Inicia sesión para recibir recomendaciones personalizadas de tus mangas recientes.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default CarruselMangasRecientes;
