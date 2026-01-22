import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useComentariosStore } from '../../store/comentariosStore';
import useAuthStore from '../../store/authStore';
import Loading from '../common/Loading';
import {
  ChatBubbleLeftIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const MAX_PROFUNDIDAD = 4; // 0 a 4 => 5 niveles

function ComentarioItemBase({
  comentario,
  nivel = 0,
  isAuthenticated,
  userId,
  formatearFecha,
  onEliminar,
  onLike,
  onResponder,
  respondiendoId,
  onEnviarRespuesta,
}) {
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const esPropio = isAuthenticated && userId === comentario.id_usuario;
  const likes = comentario.cantidad_likes ?? comentario.likes ?? 0;
  const respuestas = comentario.respuestas || [];
  const iconoClass = nivel === 0 ? 'h-10 w-10' : 'h-8 w-8';
  const trashSize = nivel === 0 ? 'h-4 w-4' : 'h-3 w-3';
  const puedeResponder = isAuthenticated && nivel < MAX_PROFUNDIDAD;
  const estaRespondiendo = respondiendoId === comentario.id;

  useEffect(() => {
    if (!estaRespondiendo) {
      setTextoRespuesta('');
    }
  }, [estaRespondiendo]);

  const manejarSubmit = async (event) => {
    event.preventDefault();
    const textoLimpio = textoRespuesta.trim();
    if (!textoLimpio) return;

    await onEnviarRespuesta(comentario.id, textoLimpio);
    setTextoRespuesta('');
  };

  return (
    <div
      className={`${nivel === 0 ? 'bg-dark-700/30' : 'bg-dark-600/50'} rounded-lg p-4`}
      style={{ marginLeft: nivel * 24 }}
    >
      <div className="flex items-start space-x-3">
        <UserCircleIcon className={`${iconoClass} text-gray-400 flex-shrink-0 mt-1`} />
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-primary-400 font-semibold">
              {comentario.nombre_usuario}
            </span>
            <span className="text-gray-500 text-sm">
              {formatearFecha(comentario.fecha_creacion)}
            </span>
            {esPropio && (
              <button
                onClick={() => onEliminar(comentario.id)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Eliminar comentario"
              >
                <TrashIcon className={`${trashSize}`} />
              </button>
            )}
          </div>
          <p className="text-gray-100 leading-relaxed mb-3">
            {comentario.texto}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <button
              type="button"
              onClick={() => onLike(comentario.id)}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-2 ${
                isAuthenticated
                  ? 'text-primary-400 hover:text-primary-300'
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>👍</span>
              <span>
                {likes} {likes === 1 ? 'Like' : 'Likes'}
              </span>
            </button>
            {puedeResponder && (
              <button
                type="button"
                onClick={() => onResponder(comentario.id)}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                {estaRespondiendo ? 'Cerrar' : 'Responder'}
              </button>
            )}
            {!puedeResponder && nivel >= MAX_PROFUNDIDAD && (
              <span className="text-gray-500 text-xs">
                Límite de respuestas alcanzado
              </span>
            )}
          </div>
          {puedeResponder && estaRespondiendo && (
            <form onSubmit={manejarSubmit} className="mt-4">
              <textarea
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-dark-600 text-gray-100 p-3 rounded-lg border border-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                rows="3"
                required
              />
              <div className="flex space-x-3 mt-2">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Responder
                </button>
                <button
                  type="button"
                  onClick={() => onResponder(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
          {respuestas.length > 0 && (
            <div className="mt-4 space-y-4">
              {respuestas.map((respuesta) => (
                <ComentarioItem
                  key={respuesta.id}
                  comentario={respuesta}
                  nivel={nivel + 1}
                  isAuthenticated={isAuthenticated}
                  userId={userId}
                  formatearFecha={formatearFecha}
                  onEliminar={onEliminar}
                  onLike={onLike}
                  onResponder={onResponder}
                  respondiendoId={respondiendoId}
                  onEnviarRespuesta={onEnviarRespuesta}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ComentarioItem = React.memo(ComentarioItemBase);

function ComentariosManga({ mangaId }) {
  const { isAuthenticated, user } = useAuthStore();
  const {
    comentarios,
    cargando,
    error,
    obtenerComentarios,
    crearComentario,
    eliminarComentario,
    likeComentario,
    limpiarError,
  } = useComentariosStore();

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [respondiendo, setRespondiendo] = useState(null);

  const comentariosOrganizados = useMemo(() => {
    const mapaComentarios = new Map();

    comentarios.forEach((comentario) => {
      mapaComentarios.set(comentario.id, {
        ...comentario,
        respuestas: [],
      });
    });

    const comentariosRaiz = [];

    mapaComentarios.forEach((comentario) => {
      if (comentario.id_comentario_padre) {
        const comentarioPadre = mapaComentarios.get(comentario.id_comentario_padre);
        if (comentarioPadre) {
          comentarioPadre.respuestas.push(comentario);
        } else {
          comentariosRaiz.push(comentario);
        }
      } else {
        comentariosRaiz.push(comentario);
      }
    });

    return comentariosRaiz;
  }, [comentarios]);

  const contarComentarios = (lista) =>
    lista.reduce(
      (total, comentarioActual) =>
        total + 1 + contarComentarios(comentarioActual.respuestas || []),
      0
    );

  const totalComentariosVisibles = useMemo(
    () => contarComentarios(comentariosOrganizados),
    [comentariosOrganizados]
  );

  useEffect(() => {
    if (mangaId) {
      obtenerComentarios(mangaId);
    }
  }, [mangaId, obtenerComentarios]);

  const manejarEnvioComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    await crearComentario(mangaId, nuevoComentario);
    setNuevoComentario('');
    setMostrarFormulario(false);
  };

  const manejarEnvioRespuesta = useCallback(
    async (comentarioId, texto) => {
      const textoLimpio = texto.trim();
      if (!textoLimpio) return;

      await crearComentario(mangaId, textoLimpio, comentarioId);
      setRespondiendo(null);
    },
    [crearComentario, mangaId]
  );

  const manejarEliminarComentario = useCallback(
    async (comentarioId) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
        await eliminarComentario(comentarioId, mangaId);
      }
    },
    [eliminarComentario, mangaId]
  );

  const manejarLikeComentario = useCallback(
    async (comentarioId) => {
      if (!isAuthenticated) return;
      await likeComentario(comentarioId, mangaId);
    },
    [isAuthenticated, likeComentario, mangaId]
  );

  const toggleResponder = useCallback((comentarioId) => {
    if (comentarioId === null) {
      setRespondiendo(null);
      return;
    }

    setRespondiendo((actual) => (actual === comentarioId ? null : comentarioId));
  }, []);

  const formatearFecha = useCallback((fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  if (cargando) {
    return <Loading message="Cargando comentarios..." />;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center space-x-2">
          <ChatBubbleLeftIcon className="h-6 w-6" />
          <span>Comentarios ({totalComentariosVisibles})</span>
        </h2>

        {isAuthenticated && (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo comentario</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button
            onClick={limpiarError}
            className="text-red-400 hover:text-red-300 underline mt-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Formulario nuevo comentario */}
      {mostrarFormulario && isAuthenticated && (
        <form onSubmit={manejarEnvioComentario} className="bg-dark-700 p-4 rounded-lg mb-6">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Escribe tu comentario sobre este manga..."
            className="w-full bg-dark-600 text-gray-100 p-3 rounded-lg border border-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            rows="4"
            required
          />
          <div className="flex space-x-3 mt-3">
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Publicar
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(false);
                setNuevoComentario('');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!isAuthenticated && (
        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg mb-6 text-center">
          <p className="text-gray-400">
            Debes iniciar sesión para comentar
          </p>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {comentariosOrganizados.map((comentario) => (
          <ComentarioItem
            key={comentario.id}
            comentario={comentario}
            nivel={0}
            isAuthenticated={isAuthenticated}
            userId={user?.id}
            formatearFecha={formatearFecha}
            onEliminar={manejarEliminarComentario}
            onLike={manejarLikeComentario}
            onResponder={toggleResponder}
            respondiendoId={respondiendo}
            onEnviarRespuesta={manejarEnvioRespuesta}
          />
        ))}

        {totalComentariosVisibles === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Aún no hay comentarios sobre este manga
            </p>
            <p className="text-gray-500">
              ¡Sé el primero en compartir tu opinión!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComentariosManga;