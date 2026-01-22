import React, { useState, useEffect, useMemo } from 'react';
import { useMangaStore } from '../../store/mangaStore';
import { MANGA_TYPES } from '../../utils/constants';
import MangaCard from './MangaCard';
import Loading from '../common/Loading';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  BookOpenIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  SignalIcon,
  UserCircleIcon,
  ArrowsUpDownIcon,
  TagIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const CANTIDAD_VISIBLE_INICIAL = 40;
const PASO_CARGA_ADICIONAL = 20;
/**
 * Componente MangaList - Lista de mangas con filtros y búsqueda
 * Permite buscar y filtrar mangas por diferentes criterios
 */
function MangaList() {
  const { 
    mangas, 
    loading, 
    error, 
    fetchMangas, 
    clearError 
  } = useMangaStore();

  // Estado de filtros y búsqueda
  const [filtros, setFiltros] = useState({
    titulo: '',
    tipo: '',
    estado_publicacion: '',
    autor: '',
    generos: [],
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [generosDisponibles, setGenerosDisponibles] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [cantidadVisible, setCantidadVisible] = useState(CANTIDAD_VISIBLE_INICIAL);

  const hayFiltrosActivos = Object.values(filtros).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  const totalFiltrosActivos = useMemo(() => {
    let count = 0;
    if (filtros.titulo) count++;
    if (filtros.tipo) count++;
    if (filtros.estado_publicacion) count++;
    if (filtros.autor) count++;
    if (filtros.generos.length > 0) count++;
    if (sortOption) count++;
    return count;
  }, [filtros, sortOption]);

  const mostrarIndicadorActivo = totalFiltrosActivos > 0;

  // Cargar mangas al montar el componente
  useEffect(() => {
    fetchMangas();
  }, [fetchMangas]);

  useEffect(() => {
    if (mangas.length === 0) {
      setGenerosDisponibles([]);
      return;
    }

    const generosUnicos = new Set();
    mangas.forEach((manga) => {
      if (Array.isArray(manga.generos)) {
        manga.generos.forEach((genero) => generosUnicos.add(genero));
      }
    });
    setGenerosDisponibles(Array.from(generosUnicos).sort((a, b) => a.localeCompare(b)));
  }, [mangas]);

  /**
   * Manejar búsqueda por título
   */
  const handleSearch = (e) => {
    e.preventDefault();
    const nuevosFiltros = {
      ...filtros,
      titulo: terminoBusqueda.trim(),
    };
    setFiltros(nuevosFiltros);
    fetchMangas(nuevosFiltros);
  };

  /**
   * Manejar cambio en filtros
   */
  const handleFilterChange = (key, value) => {
    const nuevosFiltros = {
      ...filtros,
      [key]: value,
    };
    setFiltros(nuevosFiltros);
    fetchMangas(nuevosFiltros);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  const alternarGenero = (genero) => {
    const generosActuales = filtros.generos;
    const generosActualizados = generosActuales.includes(genero)
      ? generosActuales.filter((item) => item !== genero)
      : [...generosActuales, genero];
    handleFilterChange('generos', generosActualizados);
  };

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = () => {
    const filtrosVacios = {
      titulo: '',
      tipo: '',
      estado_publicacion: '',
      autor: '',
      generos: [],
    };
    setFiltros(filtrosVacios);
    setTerminoBusqueda('');
    setSortOption('');
    fetchMangas();
  };

  const sortedMangas = useMemo(() => {
    const mangasLista = Array.isArray(mangas) ? [...mangas] : [];
    const MIN_VALUE = Number.MIN_SAFE_INTEGER;
    const MAX_VALUE = Number.MAX_SAFE_INTEGER;

    const obtenerNota = (item) =>
      typeof item?.nota_general === 'number' ? item.nota_general : null;

    const obtenerFecha = (item) => {
      const fecha =
        item?.fecha_actualizacion || item?.fecha_ultima_actualizacion || null;
      if (!fecha) {
        return null;
      }
      const timestamp = new Date(fecha).getTime();
      return Number.isFinite(timestamp) ? timestamp : null;
    };

    switch (sortOption) {
      case 'nota_desc':
        return mangasLista.sort(
          (a, b) =>
            (obtenerNota(b) ?? MIN_VALUE) - (obtenerNota(a) ?? MIN_VALUE)
        );
      case 'nota_asc':
        return mangasLista.sort(
          (a, b) =>
            (obtenerNota(a) ?? MAX_VALUE) - (obtenerNota(b) ?? MAX_VALUE)
        );
      case 'actualizacion_desc':
        return mangasLista.sort(
          (a, b) =>
            (obtenerFecha(b) ?? MIN_VALUE) - (obtenerFecha(a) ?? MIN_VALUE)
        );
      case 'actualizacion_asc':
        return mangasLista.sort(
          (a, b) =>
            (obtenerFecha(a) ?? MAX_VALUE) - (obtenerFecha(b) ?? MAX_VALUE)
        );
      default:
        return mangasLista;
    }
  }, [mangas, sortOption]);

  useEffect(() => {
    setCantidadVisible(CANTIDAD_VISIBLE_INICIAL);
  }, [sortedMangas]);

  const visibleMangas = useMemo(() => {
    if (!Array.isArray(sortedMangas)) return [];
    return sortedMangas.slice(0, cantidadVisible);
  }, [sortedMangas, cantidadVisible]);

  if (loading && mangas.length === 0) {
    return <Loading message="Cargando mangas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Biblioteca de Manga
          </h1>
          {/**La tonteria de abajo es para que sea singular o plural */}
          <p className="text-gray-400">
            {mangas.length} manga{mangas.length !== 1 ? 's' : ''} disponible{mangas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar por título..."
              className="input-field w-full pl-10 pr-4"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </form>

        {/* Botón de filtros */}
        {/** como siempre si está abierto se cierra sino se abre */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`btn-secondary flex items-center space-x-2 ${
            hayFiltrosActivos ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filtros</span>
          {hayFiltrosActivos && (
            <span className="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              !
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros */}
     {/** Solo se ve si es true */}
    {mostrarFiltros && (
      <div className="card p-6 bg-dark-900/90 border border-dark-600 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semiboldtext-gray-100 flex items-center gap-3">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-primary-400" />
              Filtros de búsqueda
              {mostrarIndicadorActivo && (
                <span className="ml-2 text-xs font-semibold bg-primary-600/30 border border-primary-500/40 text-primary-200 px-3 py-1 rounded-full">
                  {totalFiltrosActivos} activo{totalFiltrosActivos === 1 ? '' : 's'}
                </span>
              )}
            </h3>

          </div>
          <div className="flex items-center gap-2">
            {hayFiltrosActivos && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setMostrarFiltros(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            {/* Filtro por tipo */}
            <div className="bg-dark-800/70 border border-dark-600 rounded-xl p-4 shadow-inner space-y-3 hover:border-primary-500/40 transition-colors">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <Squares2X2Icon className="h-4 w-4" />
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="input-field w-full bg-dark-900/40 border-dark-500 focus:border-primary-300"
              >
                <option value="">Todos los tipos</option>
                <option value={MANGA_TYPES.MANGA}>Manga</option>
                <option value={MANGA_TYPES.MANHWA}>Manhwa</option>
                <option value={MANGA_TYPES.MANHUA}>Manhua</option>
                <option value={MANGA_TYPES.ONE_SHOT}>One Shot</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="bg-dark-800/70 border border-dark-600 rounded-xl p-4 shadow-inner space-y-3 hover:border-primary-500/40 transition-colors">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <SignalIcon className="h-4 w-4" />
                Estado
              </label>
              <select
                value={filtros.estado_publicacion}
                onChange={(e) => handleFilterChange('estado_publicacion', e.target.value)}
                className="input-field w-full bg-dark-900/40 border-dark-500 focus:border-primary-400"
              >
                <option value="">Todos los estados</option>
                <option value="emision">En emisión</option>
                <option value="finalizado">Finalizado</option>
                <option value="pausa">En pausa</option>
              </select>
            </div>

            {/* Filtro por autor */}
            <div className="bg-dark-800/70 border border-dark-600 rounded-xl p-4 shadow-inner space-y-3 hover:border-primary-500/40 transition-colors">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <UserCircleIcon className="h-4 w-4" />
                Autor
              </label>
              <input
                type="text"
                value={filtros.autor}
                onChange={(e) => handleFilterChange('autor', e.target.value)}
                placeholder="Nombre del autor"
                className="input-field w-full bg-dark-900/40 border-dark-500 focus:border-primary-400"
              />
            </div>

            {/* Ordenar por */}
            <div className="bg-dark-800/70 border border-dark-600 rounded-xl p-4 shadow-inner space-y-3 hover:border-primary-500/40 transition-colors">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <ArrowsUpDownIcon className="h-4 w-4" />
                Ordenar por
              </label>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-field w-full bg-dark-900/40 border-dark-500 focus:border-primary-400"
              >
                <option value="">Predeterminado</option>
                <option value="nota_desc">Nota general (mayor a menor)</option>
                <option value="nota_asc">Nota general (menor a mayor)</option>
                <option value="actualizacion_desc">Fecha de actualización (más recientes)</option>
                <option value="actualizacion_asc">Fecha de actualización (más antiguos)</option>
              </select>
            </div>

            {/* Filtro por géneros */}
            <div className="bg-dark-800/70 border border-dark-600 rounded-xl p-4 shadow-inner space-y-3 hover:border-primary-500/40 transition-colors xl:col-span-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <TagIcon className="h-4 w-4" />
                Géneros
              </label>
              <div className="max-h-56 overflow-y-auto border border-dark-600 rounded-lg p-3 space-y-2 bg-dark-900/40">
                {generosDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aún no hay géneros disponibles. Explora el catálogo para ver opciones.
                  </p>
                ) : (
                  generosDisponibles.map((genero) => (
                    <label
                      key={genero}
                      className="flex items-center space-x-2 text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={filtros.generos.includes(genero)}
                        onChange={() => alternarGenero(genero)}
                        className="h-4 w-4 rounded border-gray-500 bg-dark-700 text-primary-500 focus:ring-primary-400"
                      />
                      <span>{genero}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-dark-600 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              
              <button
                onClick={() => fetchMangas(filtros)}
                className="btn-primary w-full lg:w-auto flex items-center justify-center gap-2"
              >
                <CheckIcon className="h-5 w-5" />
                <span>Aplicar filtros</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Mostrar errores */}
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

      {/* Lista de mangas */}
      {mangas.length === 0 && !loading ? (
        <div className="text-center py-12">
          <BookOpenIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            No se encontraron mangas con los filtros seleccionados
          </p>
          {hayFiltrosActivos && (
            <button
              onClick={clearFilters}
              className="btn-primary mt-4"
            >
              Ver todos los mangas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {visibleMangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}

      {cantidadVisible < sortedMangas.length && (
        <div className="flex justify-center">
          <button
            onClick={() =>
              setCantidadVisible((prev) =>
                Math.min(prev + PASO_CARGA_ADICIONAL, sortedMangas.length)
              )
            }
            className="btn-secondary mt-4"
          >
            Cargar más mangas
          </button>
        </div>
      )}

      {/* Indicador de carga al hacer scroll */}
      {loading && mangas.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
}

export default MangaList;