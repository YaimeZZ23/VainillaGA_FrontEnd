import React, { useEffect, useState } from 'react';
import { useMangaStore } from '../../store/mangaStore';
import useAuthStore from '../../store/authStore';
import MangaCard from '../manga/MangaCard';
import Loading from '../common/Loading';
import { 
  HeartIcon,
  FunnelIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline';

/**
 * Componente :-- Lista personal de mangas del usuario
 * Permite filtrar por estado de lectura y gestionar la lista personal
 */
function ListaPersonal() {
  const { isAuthenticated } = useAuthStore();
  const {
    personalList, 
    loading,      
    error,        
    fetchPersonalList, 
    clearError,       
  } = useMangaStore();

  //! En este caso lo de estados es Terminado, leyendo...
  //- Estados locales para filtros
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('all'); 
  const [ordenPor, setOrdenPor] = useState('fecha_creacion');

  //- Cargar lista personal al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchPersonalList();
    }
  }, [isAuthenticated, fetchPersonalList]);

  //- Filtrar y ordenar la lista personal según filtros y orden,
  //- Primero filtra los mangas que entre en lo elegido y luego ordena
  const listaFiltrada_Y_ordenada = personalList
    .filter((manga) => {
      //- Si no hay filtros de estado se dan todos a ordenar
      if (!estadoSeleccionado || estadoSeleccionado === 'all') return true;
      //- Retornar el manga si su estado es el seleccionado
      return manga.mi_estado === estadoSeleccionado;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'titulo':
          return a.titulo.localeCompare(b.titulo); //- Orden alfabético por título
        case 'puntuacion':
          return (b.mi_puntuacion || 0) - (a.mi_puntuacion || 0); //- Orden por puntuación personal descendente
        case 'fecha_creacion':
        default:
          return new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0); //- Orden por fecha de creación, más reciente primero
      }
    });
  //- Contar mangas por estado
  const conteoPorEstado = personalList.reduce((conteo, manga) => {
    if (!manga.mi_estado) {
      return conteo;
    }
    conteo[manga.mi_estado] = (conteo[manga.mi_estado] || 0) + 1;
    return conteo;
  }, {});

  //- Si el usuario no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-4">
          Debes iniciar sesión para ver tu lista personal
        </p>
        <a href="/login" className="btn-primary">
          Iniciar Sesión
        </a>
      </div>
    );
  }

  //- Mostrar carga si todavía no hay datos
  if (loading && personalList.length === 0) {
    return <Loading message="Cargando tu lista personal..." />;
  }

  return (
    <div className="space-y-6">
      {/*- Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Mi Lista Personal
          </h1>
          <p className="text-gray-400">
            {personalList.length} manga{personalList.length !== 1 ? 's' : ''} en tu lista
          </p>
        </div>
      </div>

      {/*- Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/*- Total mangas */}
        <div
          className={`card p-4 cursor-pointer transition-colors bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/40 ${
            estadoSeleccionado === 'all' ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => setEstadoSeleccionado('all')}
        >
          <p className="text-2xl font-bold text-gray-100">
            {personalList.length}
          </p>
          <p className="text-gray-400 text-sm">Total</p>
        </div>

        {/*- Leyendo */}
        <div
          className={`card p-4 cursor-pointer transition-colors bg-gradient-to-br from-emerald-900/60 via-emerald-800/50 to-emerald-600/40 ${
            estadoSeleccionado === 'leyendo' ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => setEstadoSeleccionado('leyendo')}
        >
          <p className="text-2xl font-bold text-emerald-200">
            {conteoPorEstado.leyendo || 0}
          </p>
          <p className="text-gray-400 text-sm">Leyendo</p>
        </div>

        {/*- Completados */}
        <div
          className={`card p-4 cursor-pointer transition-colors bg-gradient-to-br from-sky-900/60 via-sky-800/50 to-sky-600/40 ${
            estadoSeleccionado === 'completado' ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => setEstadoSeleccionado('completado')}
        >
          <p className="text-2xl font-bold text-sky-200">
            {conteoPorEstado.completado || 0}
          </p>
          <p className="text-gray-400 text-sm">Completados</p>
        </div>

        {/*- Favoritos */}
        <div
          className={`card p-4 cursor-pointer transition-colors bg-gradient-to-br from-fuchsia-900/70 via-pink-800/60 to-pink-600/40 ${
            estadoSeleccionado === 'favorito' ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => setEstadoSeleccionado('favorito')}
        >
          <p className="text-2xl font-bold text-fuchsia-200">
            {conteoPorEstado.favorito || 0}
          </p>
          <p className="text-gray-400 text-sm">Favoritos</p>
        </div>

        {/*- Pendientes */}
        <div
          className={`card p-4 cursor-pointer transition-colors bg-gradient-to-br from-yellow-900/40 via-yellow-800/35 to-yellow-600/30 ${
            estadoSeleccionado === 'pendiente' ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => setEstadoSeleccionado('pendiente')}
        >
          <p className="text-2xl font-bold text-yellow-200">
            {conteoPorEstado.pendiente || 0}
          </p>
          <p className="text-gray-400 text-sm">Pendientes</p>
        </div>

        {/*- Abandonados */}
        <div
          className={`card p-4 cursor-pointer transition-colors bg-gradient-to-br from-red-950/70 via-rose-900/60 to-amber-700/35 ${
            estadoSeleccionado === 'abandonado' ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => setEstadoSeleccionado('abandonado')}
        >
          <p className="text-2xl font-bold text-rose-200">
            {conteoPorEstado.abandonado || 0}
          </p>
          <p className="text-gray-400 text-sm">Abandonados</p>
        </div>
      </div>

      {/*- Controles de filtro y ordenamiento */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300">Filtros:</span>
          </div>

          {/*- Selector de estado */}
          <select
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
            className="input-field"
          >
            <option value="all">Todos los estados</option>
            <option value="leyendo">Leyendo</option>
            <option value="completado">Completado</option>
            <option value="favorito">Favorito</option>
            <option value="pendiente">Pendiente</option>
            <option value="abandonado">Abandonado</option>
          </select>

          {/*- Selector de orden */}
          <span className="text-gray-300">Ordenados por:</span>
          <select
            value={ordenPor}
            onChange={(e) => setOrdenPor(e.target.value)}
            className="input-field"
          >
            <option value="fecha_creacion">Fecha agregado</option>
            <option value="titulo">Título A-Z</option>
            <option value="puntuacion">Mi puntuación</option>
          </select>
        </div>
      </div>

      {/*- Mostrar errores */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/*- Lista de mangas */}
      {listaFiltrada_Y_ordenada.length === 0 && !loading ? (
        <div className="text-center py-12">
          <BookOpenIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          {estadoSeleccionado === 'all' ? (
            <>
              <p className="text-gray-400 text-lg mb-4">
                Tu lista personal está vacía
              </p>
              <p className="text-gray-500 mb-6">
                Explora mangas y agrégalos a tu lista para hacer un seguimiento
              </p>
              <a href="/" className="btn-primary">
                Explorar Mangas
              </a>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-lg mb-4">
                No tienes mangas en estado "{estadoSeleccionado}"
              </p>
              <button
                onClick={() => setEstadoSeleccionado('all')}
                className="btn-primary"
              >
                Ver todos
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/*- Renderizar cada manga */}
          {listaFiltrada_Y_ordenada.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga} // info general del manga
              showPersonalActions={false} // ahora sí mostramos botones de la lista personal
              personalData={{
                estado_lectura: manga.mi_estado,
                puntuacion: manga.mi_puntuacion, 
                comentario_personal: manga.mi_comentario,
                id_ultimo_capitulo_leido: manga.id_ultimo_capitulo_leido
              }}

            />
          ))}
        </div>
      )}

      {/*- Indicador de carga adicional si ya hay mangas cargados */}
      {loading && personalList.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
}

export default ListaPersonal;
