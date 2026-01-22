import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMangaStore } from '../../store/mangaStore';
import useAuthStore from '../../store/authStore';
import ComentariosManga from './ComentariosManga';
import Loading from '../common/Loading';
import {
  StarIcon,
  HeartIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PlayIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../../utils/constants';

function MangaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    currentManga,
    personalList,
    loading,
    error,
    fetchMangaDetail,
    addToPersonalList,
    removeFromPersonalList,
    updatePersonalManga,
    fetchPersonalList,
    marcarCapituloComoLeido,
    clearError,
  } = useMangaStore();

  const [mostrarModalActualizacion, setMostrarModalActualizacion] = useState(false);
  const [mostrarTodosCapitulos, setMostrarTodosCapitulos] = useState(false);
  const [datosPersonales, setDatosPersonales] = useState({
    estado_lectura: 'pendiente',
    puntuacion: '',
    comentario_personal: '',
  });

  // Verificar si el manga está en la lista personal
  const datosMangaPersonal = personalList.find(
    (item) => item.id === parseInt(id)
  );
  const estaEnListaPersonal = !!datosMangaPersonal;
  
  const ultimoCapituloLeido = (() => {
    if (!datosMangaPersonal?.id_ultimo_capitulo_leido || !currentManga?.capitulos) {
      return 0;
    }
    
    const capitulo = currentManga.capitulos.find(
      c => c.id === datosMangaPersonal.id_ultimo_capitulo_leido
    );
    
    return capitulo ? capitulo.numero : 0;
  })();

  // Calcular progreso de lectura de forma segura
  const calcularProgreso = () => {
    if (!currentManga?.capitulos || !currentManga?.capitulos_totales || !datosMangaPersonal?.id_ultimo_capitulo_leido) {
      return { leidos: 0, porcentaje: 0 };
    }
    
    const capitulosLeidos = currentManga.capitulos.filter(
      c => c.id <= datosMangaPersonal.id_ultimo_capitulo_leido
    ).length;
    
    const porcentaje = Math.round((capitulosLeidos / currentManga.capitulos_totales) * 100);
    
    return { leidos: capitulosLeidos, porcentaje };
  };

  const progreso = calcularProgreso();

  const estilosEstadoPersonal = useMemo(() => {
    const estilosPorEstado = {
      leyendo: {
        container: 'from-emerald-900/35 to-emerald-700/35 border border-emerald-500/50',
        label: 'text-emerald-200',
        value: 'text-emerald-100',
      },
      completado: {
        container: 'from-sky-900/35 to-sky-700/35 border border-sky-500/45',
        label: 'text-sky-200',
        value: 'text-sky-100',
      },
      pendiente: {
        container: 'from-yellow-900/25 to-yellow-700/25 border border-yellow-600/35',
        label: 'text-yellow-200',
        value: 'text-yellow-100',
      },
      favorito: {
        container: 'from-fuchsia-900/45 to-pink-700/40 border border-fuchsia-500/55',
        label: 'text-fuchsia-200',
        value: 'text-fuchsia-100',
      },
      abandonado: {
        container: 'from-red-950/45 to-amber-800/35 border border-red-600/60',
        label: 'text-red-200',
        value: 'text-red-100',
      },
      default: {
        container: 'from-primary-900/40 to-primary-800/40 border border-primary-700/40',
        label: 'text-primary-200',
        value: 'text-gray-100',
      },
    };

    return estilosPorEstado[datosMangaPersonal?.mi_estado] || estilosPorEstado.default;
  }, [datosMangaPersonal?.mi_estado]);


  const posicionRankingPersonal = useMemo(() => {
    if (!personalList?.length) {
      return null;
    }

    const ranking = personalList
      .filter((manga) => manga?.mi_puntuacion !== null && manga?.mi_puntuacion !== undefined)
      .sort((a, b) => (b.mi_puntuacion || 0) - (a.mi_puntuacion || 0));

    const index = ranking.findIndex((manga) => manga.id === parseInt(id));
    return index === -1 ? null : index + 1;
  }, [personalList, id]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (id) {
      fetchMangaDetail(parseInt(id));
      if (isAuthenticated) {
        fetchPersonalList();
      }
    }
  }, [id, fetchMangaDetail, fetchPersonalList, isAuthenticated]);

  // Actualizar datos personales cuando cambie la información
  useEffect(() => {
    if (datosMangaPersonal) {
      setDatosPersonales({
        estado_lectura: datosMangaPersonal.mi_estado || 'pendiente',
        puntuacion: datosMangaPersonal.mi_puntuacion || '',
        comentario_personal: datosMangaPersonal.mi_comentario || '',
      });
    }
  }, [datosMangaPersonal]);

  // Crear la lista de los capítulos
  const crearListaCapitulos = () => {
    const capitulos = currentManga?.capitulos ?? [];
    return capitulos.map(capitulo => capitulo.numero).sort((a, b) => a - b);
  };

  // Obtener capítulos a mostrar (primeros 24 o todos)
  const obtenerCapitulosAMostrar = () => {
    const todosLosCapitulos = crearListaCapitulos();
    if (mostrarTodosCapitulos || todosLosCapitulos.length <= 24) {
      return todosLosCapitulos;
    }
    return todosLosCapitulos.slice(0, 24);
  };

  // Obtener estilo del capítulo según su estado
  const obtenerEstiloCapitulo = (numeroCapitulo) => {
    if (numeroCapitulo === ultimoCapituloLeido) {
      return 'border-primary-500 bg-primary-600/90 text-white shadow-lg';
    }

    if (numeroCapitulo < ultimoCapituloLeido) {
      return 'border-transparent bg-dark-600 text-gray-100 hover:bg-dark-500';
    }

    return 'border-dark-600 bg-dark-700/80 text-gray-300 hover:bg-dark-600 hover:text-white';
  };

  const obtenerIconoCapitulo = (numeroCapitulo) => {
    if (numeroCapitulo === ultimoCapituloLeido) {
      return <PlayIcon className="h-5 w-5" />;
    }

    if (numeroCapitulo < ultimoCapituloLeido) {
      return <CheckCircleIcon className="h-4 w-4" />;
    }

    return <BookOpenIcon className="h-4 w-4" />;
  };

  // Manejar clic en capítulo
  const manejarClicCapitulo = async (numeroCapitulo) => {
    if (estaEnListaPersonal) {
      await marcarCapituloComoLeido(parseInt(id), numeroCapitulo);
    }
    const cap = currentManga.capitulos.find(c => c.numero === numeroCapitulo);
    if (!cap) {
      console.error("Capítulo no encontrado en currentManga.capitulos");
      return;
    }
    const capId = cap.id;
    navigate(`/manga/${id}/chapter/${capId}`);
  };

  // Formatear fecha para mostrar última actualización
  const formatearFechaActualizacion = (fechaString) => {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
    if (diferenciaDias < 30) return `Hace ${Math.floor(diferenciaDias / 7)} semanas`;
    return fecha.toLocaleDateString('es-ES');
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'emision':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'finalizado':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'pausa':
        return <PauseCircleIcon className="h-5 w-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const obtenerTextoEstado = (estado) => {
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

  const manejarCambioListaPersonal = async () => {
    if (estaEnListaPersonal) {
      await removeFromPersonalList(parseInt(id));
    } else {
      await addToPersonalList(parseInt(id), 'pendiente');
    }
  };

  const manejarActualizacionDatosPersonales = async (e) => {
    e.preventDefault();
    
    const datosActualizacion = {
      estado_lectura: datosPersonales.estado_lectura,
      puntuacion: datosPersonales.puntuacion ? parseFloat(datosPersonales.puntuacion) : null,
      comentario_personal: datosPersonales.comentario_personal || null,
    };

    await updatePersonalManga(parseInt(id), datosActualizacion);
    setMostrarModalActualizacion(false);
  };

  if (loading || !currentManga) {
    return <Loading message="Cargando información del manga..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => { clearError(); navigate('/'); }} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Volver</span>
      </button>

      {/* Header del manga */}
      <div className="card p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portada */}
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-dark-700 shadow-2xl">
              {currentManga.url_portada ? (
                <img
                  src={API_BASE_URL + currentManga.url_portada}
                  alt={currentManga.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpenIcon className="h-24 w-24 text-gray-500" />
                </div>
              )}
            </div>

            {/* Acciones */}
            {isAuthenticated && (
              <div className="mt-6 space-y-4">
                <button
                  onClick={manejarCambioListaPersonal}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-lg transition-all duration-200 font-semibold text-lg ${
                    estaEnListaPersonal
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg'
                  }`}
                >
                  {estaEnListaPersonal ? (
                    <>
                      <HeartSolidIcon className="h-6 w-6" />
                      <span>En mi lista</span>
                    </>
                  ) : (
                    <>
                      <HeartIcon className="h-6 w-6" />
                      <span>Agregar a mi lista</span>
                    </>
                  )}
                </button>

                {estaEnListaPersonal && (
                  <button
                    onClick={() => setMostrarModalActualizacion(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-lg transition-all duration-200 font-semibold"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    <span>Actualizar progreso</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Título y metadatos */}
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-6 leading-tight">
                {currentManga.titulo}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-lg text-gray-400">
                <div className="flex items-center space-x-2 bg-dark-700 px-4 py-2 rounded-full">
                  {obtenerIconoEstado(currentManga.estado_publicacion)}
                  <span>{obtenerTextoEstado(currentManga.estado_publicacion)}</span>
                </div>

                <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-full uppercase font-bold">
                  {currentManga.tipo}
                </span>

                {currentManga?.autor && (
                  <span className="bg-dark-700 px-4 py-2 rounded-full">
                    Por {currentManga.autor}
                  </span>
                )}

                {currentManga.nota_general && (
                  <div className="flex items-center space-x-2 bg-dark-700 px-4 py-2 rounded-full">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      {currentManga.nota_general.toFixed(1)}
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Descripción */}
            {currentManga.descripcion && (
              <div className="bg-dark-700/50 p-6 rounded-lg border border-dark-600">
                <h3 className="text-xl font-bold text-gray-100 mb-3">Sinopsis</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{currentManga.descripcion}</p>
              </div>
            )}

            {/* Géneros - CORREGIDO */}
            {currentManga.generos && currentManga.generos.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-4">Géneros</h3>
                <div className="flex flex-wrap gap-3">
                  {currentManga.generos.map((genero, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-dark-600 to-dark-700 text-gray-300 px-4 py-2 rounded-full text-sm font-medium border border-dark-500"
                    >
                      {genero}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Información personal resumida */}
            {estaEnListaPersonal && datosMangaPersonal && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 bg-gradient-to-br ${estilosEstadoPersonal.container} rounded-xl shadow-lg text-center`}>
                    <p className={`text-xs uppercase tracking-wide ${estilosEstadoPersonal.label}`}>Estado</p>
                    <p className={`mt-2 text-xl font-semibold capitalize ${estilosEstadoPersonal.value}`}>
                      {datosMangaPersonal.mi_estado}
                    </p>
                  </div>

                  {datosMangaPersonal.mi_puntuacion && (
                    <div className="p-4 bg-gradient-to-br from-yellow-900/40 via-yellow-800/35 to-yellow-700/30 border border-yellow-600/40 rounded-xl shadow-lg text-center">
                      <p className="text-xs uppercase tracking-wide text-yellow-200">Mi nota</p>
                      <div className="mt-2 flex items-center justify-center space-x-2 text-yellow-100">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="text-xl font-semibold">{datosMangaPersonal.mi_puntuacion}/10</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-br from-primary-900/20 to-primary-800/20 border border-primary-700/30 rounded-xl shadow-lg text-center">
                    <p className="text-xs uppercase tracking-wide text-primary-200">Progreso</p>
                    <p className="mt-2 text-xl font-semibold text-gray-100">{progreso.porcentaje}%</p>
                    <p className="text-xs text-gray-400">{progreso.leidos} / {currentManga.capitulos_totales ?? currentManga.capitulos?.length ?? 0} caps.</p>
                  </div>

                  {posicionRankingPersonal && (
                    <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/40 rounded-xl shadow-lg text-center">
                      <p className="text-xs uppercase tracking-wide text-purple-200">Ranking</p>
                      <div className="mt-2 flex items-center justify-center space-x-2 text-gray-100">
                        <TrophyIcon className="h-5 w-5 text-purple-300" />
                        <span className="text-xl font-semibold">#{posicionRankingPersonal}</span>
                      </div>
                      <p className="text-xs text-gray-400">En tu lista personal</p>
                    </div>
                  )}
                </div>

                {datosMangaPersonal.mi_comentario && (
                  <div className="p-5 bg-dark-800/60 border border-dark-600 rounded-xl shadow-lg">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Mi comentario</p>
                    <p className="text-gray-100 text-sm leading-relaxed italic">"{datosMangaPersonal.mi_comentario}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentManga.capitulos_totales && (
                <div className="text-center p-6 bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl border border-dark-600 shadow-lg">
                  <BookOpenIcon className="h-10 w-10 text-primary-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-100 mb-1">{currentManga.capitulos_totales}</p>
                  <p className="text-gray-400 text-medium font-medium">Capítulos</p>
                </div>
              )}

              {(currentManga.fecha_creacion || currentManga.fecha_ultima_actualizacion) && (
                <div className="text-center p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl border border-yellow-700/30 shadow-lg">
                  <CalendarIcon className="h-10 w-10 text-yellow-300 mx-auto mb-3" />
                  <div className="mt-3 space-y-2 text-sm">
                    {currentManga.fecha_creacion && (
                      <p className="flex items-center justify-center gap-2 text-gray-300 text-lg">
                        <CalendarIcon className="h-4 w-4 text-blue-400" />
                        <span>
                          Creado: {new Date(currentManga.fecha_creacion).toLocaleDateString('es-ES')}
                        </span>
                      </p>
                    )}
                    {currentManga.fecha_actualizacion && (
                      <p className="flex items-center justify-center gap-2 text-gray-300 text-lg">
                        <ClockIcon className="h-4 w-4 text-yellow-300" />
                        <span>
                          Actualizado: {formatearFechaActualizacion(currentManga.fecha_actualizacion)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de capítulos */}
      {currentManga.capitulos_totales > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100">
              Capítulos ({currentManga.capitulos_totales} total)
            </h2>
            
            {currentManga.capitulos_totales > 24 && (
              <button
                onClick={() => setMostrarTodosCapitulos(!mostrarTodosCapitulos)}
                className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                {mostrarTodosCapitulos ? (
                  <>
                    <EyeSlashIcon className="h-5 w-5" />
                    <span>Mostrar menos</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-5 w-5" />
                    <span>Ver todos</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-3">
            {obtenerCapitulosAMostrar().map((numeroCapitulo) => (
              <button
                key={numeroCapitulo}
                onClick={() => manejarClicCapitulo(numeroCapitulo)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 
                  font-medium shadow-sm min-h-[80px] cursor-pointer hover:shadow-md hover:scale-105
                  ${obtenerEstiloCapitulo(numeroCapitulo)}
                `}
              >
                <div className="mb-2">{obtenerIconoCapitulo(numeroCapitulo)}</div>
                <span className="text-sm font-semibold">{numeroCapitulo}</span>
              </button>
            ))}
          </div>
          
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg text-center">
              <p className="text-gray-400 text-base">
                <Link to="/login" className="text-primary-300 hover:text-primary-200 text-lg font-bold underline">
                  Inicia sesión
                </Link> <br /> para llevar un registro de tu progreso de lectura
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sección de comentarios*/}
      <ComentariosManga mangaId={parseInt(id)} />

      {/* Modal de actualización */}
      {mostrarModalActualizacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-100 mb-6">Actualizar progreso</h3>
            
            <form onSubmit={manejarActualizacionDatosPersonales} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado de lectura
                </label>
                <select
                  value={datosPersonales.estado_lectura}
                  onChange={(e) => setDatosPersonales({
                    ...datosPersonales,
                    estado_lectura: e.target.value
                  })}
                  className="input-field w-full"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="leyendo">Leyendo</option>
                  <option value="completado">Completado</option>
                  <option value="favorito">Favorito</option>
                  <option value="abandonado">Abandonado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Puntuación (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={datosPersonales.puntuacion}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDatosPersonales({
                      ...datosPersonales,
                      puntuacion: value === '' ? '' : parseFloat(value)
                    });
                  }}
                  className="input-field w-full"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comentario personal
                </label>
                <textarea
                  value={datosPersonales.comentario_personal}
                  onChange={(e) => setDatosPersonales({
                    ...datosPersonales,
                    comentario_personal: e.target.value
                  })}
                  className="input-field w-full h-24 resize-none"
                  placeholder="¿Qué opinas de este manga?"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalActualizacion(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MangaDetail;