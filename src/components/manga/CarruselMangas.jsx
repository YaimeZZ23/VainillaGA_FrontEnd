import React, { useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMangaStore } from '../../store/mangaStore';
import useAuthStore from '../../store/authStore';
import MangaCard from './MangaCard';
import Loading from '../common/Loading';

/**
 * CarruselMangas, con desplazamiento lateral
 */
function CarruselMangas({ titulo = 'Mangas destacados', idSeccion = undefined }) {
  const { mangas, loading, fetchMangas } = useMangaStore();
  const { isAuthenticated } = useAuthStore();
  const carruselRef = useRef(null);

  useEffect(() => {
    if (mangas.length === 0) {
      fetchMangas();
    }
  }, [mangas.length, fetchMangas]);

  const mangasMostrados = mangas.slice(0, 10);

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
      </div>

      {loading && mangasMostrados.length === 0 ? (
        <Loading message="Cargando mangas..." />
      ) : mangasMostrados.length === 0 ? (
        <p className="text-gray-400">Aún no hay mangas para mostrar.</p>
      ) : (
        <>
          <div className="relative">
            <div
              ref={carruselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory"
            >
              {mangasMostrados.map((manga) => (
                <div
                  key={manga.id}
                  className="snap-start min-w-[220px] sm:min-w-[240px] lg:min-w-[260px]"
                >
                  <MangaCard manga={manga} />
                </div>
              ))}
            </div>
            {/* Botones de desplazamiento y difuminado */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none hidden md:flex justify-between items-center">
              <div className="bg-gradient-to-r from-dark-900/80 via-dark-900/25 to-transparent w-16 h-full" />
              <div className="bg-gradient-to-l from-dark-900/80 via-dark-900/25 to-transparent w-16 h-full" />
            </div>
          </div>
          {!isAuthenticated && (
            <p className="text-sm text-yellow-400">
              Inicia sesión para guardar mangas en tu lista personal.
            </p>
          )}
          <p className="text-sm text-gray-500 md:hidden">
            Desliza hacia los lados para ver más mangas.
          </p>
        </>
      )}
    </section>
  );
}

export default CarruselMangas;
