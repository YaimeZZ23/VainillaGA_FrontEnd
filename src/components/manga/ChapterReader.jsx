import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMangaStore } from '../../store/mangaStore';
import Loading from '../common/Loading';
import { 
  XMarkIcon, 
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../utils/constants';

function ChapterReader() {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const {
    currentChapter,
    loading,
    error,
    fetchChapterPages,
    clearError,
  } = useMangaStore();

  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [modoVisualizacion, setModoVisualizacion] = useState('vertical'); // 'vertical' | 'horizontal'
  const [paginaActual, setPaginaActual] = useState(0);
  const [mostrarControles, setMostrarControles] = useState(true);
  const [temporizadorControles, setTemporizadorControles] = useState(null);
  const [soloLectura, setSoloLectura] = useState(false);

  // Normalizar páginas para evitar errores
  const paginas = Array.isArray(currentChapter?.paginas)
    ? currentChapter.paginas
    : Array.isArray(currentChapter?.pages)
      ? currentChapter.pages
      : currentChapter?.pages && typeof currentChapter.pages === 'object'
        ? Object.values(currentChapter.pages)
        : [];

  useEffect(() => {
    if (mangaId && chapterId) {
      fetchChapterPages(parseInt(chapterId), parseInt(mangaId));
    }
  }, [mangaId, chapterId, fetchChapterPages]);

  // Detectar orientación y ajustar modo por defecto
  useEffect(() => {
    const actualizarModo = () => {
      const esMovil = window.innerWidth <= 768;
      const esHorizontal = window.innerWidth > window.innerHeight;
      
      // En móvil horizontal, usar modo horizontal por defecto
      if (esMovil && esHorizontal) {
        setModoVisualizacion('horizontal');
      } else {
        setModoVisualizacion('vertical');
      }
    };

    actualizarModo();
    window.addEventListener('resize', actualizarModo);
    window.addEventListener('orientationchange', () => {
      setTimeout(actualizarModo, 100);
    });

    return () => {
      window.removeEventListener('resize', actualizarModo);
      window.removeEventListener('orientationchange', actualizarModo);
    };
  }, []);

  // Ocultar controles automáticamente
  useEffect(() => {
    if (soloLectura) {
      if (temporizadorControles) {
        clearTimeout(temporizadorControles);
        setTemporizadorControles(null);
      }
      return;
    }

    if (temporizadorControles) {
      clearTimeout(temporizadorControles);
    }
    
    const timeout = setTimeout(() => {
      setMostrarControles(false);
    }, 3000);
    
    setTemporizadorControles(timeout);

    return () => {
      if (temporizadorControles) {
        clearTimeout(temporizadorControles);
      }
    };
  }, [mostrarControles, soloLectura, temporizadorControles]);

  const mostrarControlesTemporalmente = useCallback(() => {
    if (soloLectura) return;
    setMostrarControles(true);
  }, [soloLectura]);

  // Mostrar controles al mover el ratón o tocar
  useEffect(() => {
    if (soloLectura || typeof window === 'undefined') return;

    const isMobile = window.innerWidth <= 768;

    const handleMouseMove = mostrarControlesTemporalmente;
    const handleTouchStart = mostrarControlesTemporalmente;
    const handleTouchMove = mostrarControlesTemporalmente;

    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (isMobile) {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [soloLectura, mostrarControlesTemporalmente]);

  // Navegación por teclado y gestos
  useEffect(() => {
    const manejarTeclas = (e) => {
      if (modoVisualizacion === 'horizontal') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          paginaAnterior();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          paginaSiguiente();
        }
      }
      
      if (e.key === 'Escape') {
        salirDelLector();
      }
    };

    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
  }, [modoVisualizacion, paginaActual, paginas]);

  // Pantalla completa
  const alternarPantallaCompleta = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setPantallaCompleta(true);
      }).catch(err => {
        console.log('Error al entrar en pantalla completa:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setPantallaCompleta(false);
      }).catch(err => {
        console.log('Error al salir de pantalla completa:', err);
      });
    }
  };

  const alternarSoloLectura = () => {
    if (soloLectura) {
      setSoloLectura(false);
      setMostrarControles(true);
    } else {
      setSoloLectura(true);
      setMostrarControles(false);
    }
  };

  // Navegación de páginas
  const paginaSiguiente = () => {
    if (paginaActual < paginas.length - 1) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const salirDelLector = () => {
    navigate(`/manga/${mangaId}`);
  };

  // Gestos táctiles para móvil
  const [toqueInicio, setToqueInicio] = useState(null);
  const [toqueFin, setToqueFin] = useState(null);

  const manejarInicioToque = (e) => {
    setToqueFin(null);
    setToqueInicio(e.targetTouches[0].clientX);
  };

  const manejarMovimientoToque = (e) => {
    setToqueFin(e.targetTouches[0].clientX);
  };

  const manejarFinToque = () => {
    if (!toqueInicio || !toqueFin) return;
    
    const distancia = toqueInicio - toqueFin;
    const esDeslizamientoIzquierda = distancia > 50;
    const esDeslizamientoDerecha = distancia < -50;

    if (modoVisualizacion === 'horizontal') {
      if (esDeslizamientoIzquierda) paginaSiguiente();
      if (esDeslizamientoDerecha) paginaAnterior();
    }
  };

  if (loading || !currentChapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading message="Cargando capítulo..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center p-4">
        <div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              navigate(`/manga/${mangaId}`);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver al manga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onMouseMove={mostrarControlesTemporalmente}
      onTouchStart={mostrarControlesTemporalmente}
    >
      {/* Controles superiores */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300 ${
          soloLectura ? '-translate-y-full opacity-0 pointer-events-none' : mostrarControles ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between p-3 md:p-4 gap-2 flex-wrap">
          {/* Botón volver */}
          <button
            onClick={salirDelLector}
            className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 md:px-4 md:py-2 text-white hover:text-primary-400 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
            <span className="hidden sm:inline text-sm md:text-base">Cerrar</span>
          </button>

          {/* Controles */}
          <div className="flex items-center flex-wrap justify-end gap-2">
            {/* Cambiar modo de visualización */}
            <button
              onClick={() => setModoVisualizacion(modoVisualizacion === 'vertical' ? 'horizontal' : 'vertical')}
              className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              title={`Cambiar a modo ${modoVisualizacion === 'vertical' ? 'horizontal' : 'vertical'}`}
            >
              {modoVisualizacion === 'vertical' ? 
                <ArrowLeftIcon className="h-5 w-5" /> : 
                <ChevronDownIcon className="h-5 w-5" />
              }
            </button>

            {/* Pantalla completa */}
            <button
              onClick={alternarPantallaCompleta}
              className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Pantalla completa"
            >
              {pantallaCompleta ? 
                <ArrowsPointingInIcon className="h-5 w-5" /> : 
                <ArrowsPointingOutIcon className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal de páginas */}
      {modoVisualizacion === 'vertical' ? (
        // Modo vertical (scroll continuo)
        <div className="w-full min-h-screen pt-16 pb-8">
          <div className="max-w-5xl mx-auto px-2 sm:px-4 md:px-6">
            {paginas.length === 0 ? (
              <div className="flex items-center justify-center h-screen">
                <p className="text-gray-400 text-lg">Sin páginas disponibles</p>
              </div>
            ) : (
              <div className="space-y-1">
                {paginas.map((pagina, idx) => (
                  <div key={idx} className="flex justify-center">
                    <img
                      src={API_BASE_URL + pagina.url}
                      alt={`Página ${idx + 1}`}
                      className="max-w-full h-auto object-contain rounded-md shadow-lg"
                      style={{ 
                        maxHeight: '100vh',
                        width: 'auto'
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.error(`Error cargando página ${idx + 1}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Modo horizontal (página por página)
        <div 
          className="w-full h-screen flex items-center justify-center pt-16"
          onTouchStart={manejarInicioToque}
          onTouchMove={manejarMovimientoToque}
          onTouchEnd={manejarFinToque}
        >
          {paginas.length === 0 ? (
            <p className="text-gray-400 text-lg">Sin páginas disponibles</p>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {paginaActual > 0 && (
                <div
                  className={`absolute left-2 md:left-4 z-40 bg-black/60 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-white transition-all ${
                    mostrarControles && !soloLectura ? 'opacity-100' : 'opacity-0'
                  } pointer-events-none`}
                >
                  <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              )}

              {/* Imagen actual */}
              <div className="w-full h-full flex items-center justify-center px-6 sm:px-10 md:px-16">
                <img
                  src={API_BASE_URL + paginas[paginaActual].url}
                  alt={`Página ${paginaActual + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error(`Error cargando página ${paginaActual + 1}`);
                  }}
                />
              </div>

              {/* Botón página siguiente */}
              {paginaActual < paginas.length - 1 && (
                <div
                  className={`absolute right-2 md:right-4 z-40 bg-black/60 backdrop-blur-sm rounded-full p-1.5 sm:p-2 text-white transition-all ${
                    mostrarControles && !soloLectura ? 'opacity-100' : 'opacity-0'
                  } pointer-events-none`}
                >
                  <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              )}

              {/* Áreas de clic para navegación */}
              <div className="absolute inset-0 z-30 flex">
                <div
                  className="w-1/2 h-full"
                  onClick={paginaAnterior}
                />
                <div
                  className="w-1/2 h-full"
                  onClick={paginaSiguiente}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador de progreso para modo horizontal */}
      {modoVisualizacion === 'horizontal' && paginas.length > 0 && !soloLectura && (
        <div 
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
            mostrarControles ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            {paginaActual + 1} / {paginas.length}
          </div>
        </div>
      )}

      {/* Indicadores de navegación para móvil */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden pointer-events-none">
        {modoVisualizacion === 'horizontal' && !soloLectura && (
          <div className="flex justify-between items-center">
            <div className="text-white text-xs bg-black/60 backdrop-blur-sm rounded px-2 py-1 pointer-events-auto">
              ← Anterior
            </div>
            <div className="text-white text-xs bg-black/60 backdrop-blur-sm rounded px-2 py-1 pointer-events-auto">
              Siguiente →
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={alternarSoloLectura}
        className="fixed bottom-4 right-4 z-50 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={soloLectura ? 'Mostrar controles del lector' : 'Ocultar interfaz del lector'}
      >
        {soloLectura ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}

export default ChapterReader;