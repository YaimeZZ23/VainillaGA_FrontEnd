import React from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  HeartIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  PauseCircleIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import useAuthStore from '../../store/authStore';
import { useMangaStore } from '../../store/mangaStore';
import { API_BASE_URL } from '../../utils/constants';

// Componente :-- Tarjeta de manga individual
// Muestra información básica del manga
function MangaCard({ manga, showPersonalActions = true, personalData = null }) {
  const { isAuthenticated } = useAuthStore();
  const { addToPersonalList, removeFromPersonalList } = useMangaStore();

  // Verificar si el manga está en la lista personal
  const isInPersonalList = !!personalData;

  // Obtener el icono del estado de publicación
  // Parámetro: estado (string) indica el estado del manga. Devuelve el icono correspondiente
  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'emision':
        return <ClockIcon className="h-4 w-4 text-yellow-400" />;
      case 'finalizado':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'pausa':
        return <PauseCircleIcon className="h-4 w-4 text-orange-400" />;
      default:
        return null;
    }
  };

  // Obtener el texto del estado de publicación
  const getStatusText = (estado) => {
    switch (estado) {
      case 'emision':
        return 'En emisión';
      case 'finalizado':
        return 'Finalizado';
      case 'pausa':
        return 'En pausa';
      default:
        return 'Desconocido';
    }
  };

  // Manejar agregar o quitar el manga de la lista personal
  const handleTogglePersonalList = async (e) => {
    e.preventDefault(); // Evitar navegación del Link padre
    e.stopPropagation();

    if (isInPersonalList) {
      await removeFromPersonalList(manga.id);
    } else {
      await addToPersonalList(manga.id, 'pendiente');
    }
  };

  return (
    <div className="card group h-full flex flex-col hover:scale-105 transition-transform duration-200">
      <Link to={`/manga/${manga.id}`} className="flex flex-col h-full">
        {/* Imagen de portada */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {manga.url_portada ? (
            <img
              src={API_BASE_URL+manga.url_portada}
              alt={manga.titulo}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-dark-700 flex items-center justify-center">
              <BookOpenIcon className="h-16 w-16 text-gray-500" />
            </div>
          )}

          {/* Badge del tipo de manga */}
          <div className="absolute top-2 left-2">
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full uppercase font-semibold">
              {manga.tipo}
            </span>
          </div>
          

          {/* informacion adicional del manga cuando se pasa el raton, nota y descripcion */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              {/* Nota */}
              {manga.nota_general && (
                <div className="flex items-center space-x-1 mb-2">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-semibold">
                    {manga.nota_general.toFixed(1)}
                  </span>
                </div>
              )}
              
              {/* Descripcion del manga */}
              {manga.descripcion && (
                <p className="text-white text-sm line-clamp-3">
                  {manga.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información del manga */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Título */}
          <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {manga.titulo}
          </h3>

          {/* Autor */}
          {manga.autor && (
            <p className="text-gray-400 text-sm mb-2">
              por {manga.autor}
            </p>
          )}

          {/* Estado y capítulos */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              {getStatusIcon(manga.estado_publicacion)}
              <span className="text-gray-400">
                {getStatusText(manga.estado_publicacion)}
              </span>
            </div>
            
            {manga.capitulos_totales && (
              <div className="flex items-center space-x-1">
                <BookOpenIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">
                  {manga.capitulos_totales} caps
                </span>
              </div>
            )}
          </div>

          {/* Generos 
          Sacamos los primeros 3 generos y si hay mas, mostramos un + con el numero del resto*/}
          {manga.generos && manga.generos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {manga.generos.slice(0, 3).map((genero, index) => (
                <span
                  key={index}
                  className="bg-dark-600 text-gray-300 text-xs px-2 py-1 rounded-full"
                >
                  {genero}
                </span>
              ))}
              {manga.generos.length > 3 && (
                <span className="bg-dark-600 text-gray-400 text-xs px-2 py-1 rounded-full">
                  +{manga.generos.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Información personal (si está en la lista) */}
          {personalData && (
            <div className="pt-3 border-t border-dark-600 mt-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Estado:</span>
                <span className="text-primary-400 capitalize">
                  {personalData.estado_lectura}
                </span>
              </div>
              
              {personalData.puntuacion && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-400">Mi puntuación:</span>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400">
                      {personalData.puntuacion}/10
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default MangaCard;