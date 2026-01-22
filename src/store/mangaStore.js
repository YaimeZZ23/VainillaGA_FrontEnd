import { create } from 'zustand';
import apiService from '../services/api';

/**
 * Store global para mangas usando Zustand
 * Maneja el estado de mangas, lista personal y recomendaciones
 */
export const useMangaStore = create((set, get) => ({
  // Estado inicial
  mangas: [],
  personalList: [],
  recommendations: [],
  currentManga: null,
  currentChapter: null,
  loading: false,
  error: null,

  // Acciones para mangas
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),


  fetchMangas: async (query = {}) => {
    set({ loading: true, error: null });
    try {
      const mangas = await apiService.getMangas(query);
      set({ mangas, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener detalle de un manga específico
  // Parámetro: id (number) representa el ID del manga
  fetchMangaDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const manga = await apiService.getMangaDetail(id);
      
      set({
        //- Aqui se usa ...manga Para desempaquetar el objeto, (json) para que quede como un solo json, 
        //- si no se desempaqueta, se quedara como manga: {informacion manga}, chapters.  
        //- en vez de {informacion}, chapters. Es por simple comodidad para no hacer currentManga.manga.id
        currentManga: { ...manga },
        
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Marcar un capítulo específico como leído
  // Parámetros: mangaId (number) ID del manga, numeroCapitulo (number) número del capítulo leído
  marcarCapituloComoLeido: async (mangaId, numeroCapitulo) => {
    try {
      // Buscar el ID del capítulo basado en su número
      const { currentManga } = get();
      if (!currentManga?.capitulos) {
        throw new Error('No se encontraron capítulos para este manga');
      }
      
      const capitulo = currentManga.capitulos.find(c => c.numero === numeroCapitulo);
      if (!capitulo) {
        throw new Error(`No se encontró el capítulo ${numeroCapitulo}`);
      }

      const updateData = {
        id_ultimo_capitulo_leido: capitulo.id,
        estado_lectura: numeroCapitulo > 0 ? 'leyendo' : 'pendiente'
      };
      
      await apiService.updatePersonalManga(mangaId, updateData);
      // Refrescar la lista personal
      get().fetchPersonalList();
    } catch (error) {
      set({ error: error.message });
    }
  },
  // Obtener páginas de un capítulo
  // Parámetros: chapterId (number) ID del capítulo, mangaId (number) ID del manga
  fetchChapterPages: async (chapterId, mangaId) => {
    set({ loading: true, error: null });
    try {
      const chapterData = await apiService.getChapterPages(chapterId, mangaId);
      set({
        currentChapter: chapterData,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener lista personal del usuario
  fetchPersonalList: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getPersonalList();
      const personalList = Array.isArray(response)
        ? response.filter((manga) => {
            if (!manga || typeof manga !== 'object') return false;
            if (manga.mi_estado && typeof manga.mi_estado === 'string') return true;
            if (typeof manga.esta_en_lista !== 'undefined') return Boolean(manga.esta_en_lista);
            return false;
          })
        : [];
      //const personalList = normalizePersonalListResponse(response);
      set({ personalList, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Agregar un manga a la lista personal
  // Parámetros: mangaId (number) ID del manga, status (string) estado de lectura
  addToPersonalList: async (mangaId, status = 'pendiente') => {
    try {
      await apiService.addToPersonalList(mangaId, status);
      // Refrescar la lista personal
      get().fetchPersonalList();
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Quitar un manga de la lista personal
  // Parámetro: mangaId (number) ID del manga
  removeFromPersonalList: async (mangaId) => {
    try {
      await apiService.removeFromPersonalList(mangaId);
      // Refrescar la lista personal
      get().fetchPersonalList();
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Actualizar información personal de un manga
  // Parámetros: mangaId (number) ID del manga, updateData (object) datos a actualizar
  updatePersonalManga: async (mangaId, updateData) => {
    try {
      await apiService.updatePersonalManga(mangaId, updateData);
      // Refrescar la lista personal
      get().fetchPersonalList();
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Obtener recomendaciones personalizadas
  // Parámetro: cantidad (number) número de recomendaciones
  fetchRecommendations: async (cantidad = 5) => {
    set({ loading: true, error: null });
    try {
      const recommendations = await apiService.getRecommendations(cantidad);
      
      set({ recommendations, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  

  // Acciones para limpiar el estado
  clearCurrentManga: () => set({ currentManga: null }),
  clearCurrentChapter: () => set({ currentChapter: null }),
}));