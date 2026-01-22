import { create } from 'zustand';
import apiService from '../services/api';

export const useComentariosStore = create((set, get) => ({
  // Estado inicial
  comentarios: [],
  cargando: false,
  error: null,

  // Acciones
  establecerCargando: (cargando) => set({ cargando }),
  establecerError: (error) => set({ error }),
  limpiarError: () => set({ error: null }),

  // Obtener comentarios de un manga
  // Parámetro: mangaId (number) representa el ID del manga
  obtenerComentarios: async (mangaId) => {
    set({ cargando: true, error: null });
    try {
      const comentarios = await apiService.obtenerComentarios(mangaId);
      set({ comentarios, cargando: false });
    } catch (error) {
      set({ error: error.message, cargando: false });
    }
  },

  // Crear un nuevo comentario
  // Parámetros: mangaId (number) ID del manga, texto (string) contenido del comentario, idComentarioPadre (number|null) ID del comentario padre
  crearComentario: async (mangaId, texto, idComentarioPadre = null) => {
    try {
      await apiService.crearComentario(mangaId, texto, idComentarioPadre);
      // Recargar comentarios después de crear uno nuevo
      get().obtenerComentarios(mangaId);
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Eliminar un comentario
  // Parámetros: comentarioId (number) ID del comentario, mangaId (number) ID del manga usado para recargar comentarios
  eliminarComentario: async (comentarioId, mangaId) => {
    try {
      await apiService.eliminarComentario(comentarioId);
      // Recargar comentarios después de eliminar
      get().obtenerComentarios(mangaId);
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Dar like a un comentario
  // Parámetros: comentarioId (number) ID del comentario, mangaId (number) ID del manga usado para recargar comentarios
  likeComentario: async (comentarioId, mangaId) => {
    try {
      await apiService.likeComentario(comentarioId);
      get().obtenerComentarios(mangaId);
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Limpiar estado
  limpiarComentarios: () => set({ comentarios: [], error: null }),
}));