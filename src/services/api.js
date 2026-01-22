import { API_BASE_URL } from '../utils/constants';

/**
 * Clase para manejar todas las llamadas a la API
 * Incluye manejo de autenticación y errores
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL+'/api';
  }

  // Método genérico para hacer peticiones HTTP
  // Parámetros: endpoint (string) indica el endpoint, options (object) contiene método, headers y body. Devuelve una Promesa con la respuesta
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configuración por defecto
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Manejar respuestas no exitosas
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, redirigir al login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          // Si no es JSON válido, usar el mensaje por defecto
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en la petición API:', error);
      throw error;
    }
  }

  // Métodos de autenticación
  async register(userData) {
    return this.request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Métodos de mangas
  async getMangas(query = {}) {
    const queryString = new URLSearchParams(query).toString();
    const url = `/mangas/${queryString ? `?${queryString}` : ''}`;

    return this.request(url, {
      method: 'GET',
    });
  }

  async getMangaDetail(id) {
    return this.request(`/mangas/${id}`);
  }

  async getMangaChapters(mangaId) {
    return this.request(`/mangas/${mangaId}/capitulos`);
  }

  async getChapterPages(chapterId, mangaId) {
    return this.request(`/capitulos/${chapterId}/manga/${mangaId}`);
  }

  // Métodos de lista personal
  async getPersonalList() {
    return this.request('/personal/');
  }

  async addToPersonalList(mangaId, status = 'pendiente') {
    return this.request(`/personal/${mangaId}?estado_lectura=${status}`, {
      method: 'POST',
    });
  }

  async removeFromPersonalList(mangaId) {
    return this.request(`/personal/${mangaId}`, {
      method: 'DELETE',
    });
  }

  async updatePersonalManga(mangaId, updateData) {
    return this.request(`/personal/${mangaId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getRecommendations(cantidad = 5) {
    return this.request(`/personal/recomendaciones?cantidad=${cantidad}`);
  }

  // Métodos de comentarios
  async obtenerComentarios(mangaId) {
    return this.request(`/comentarios/${mangaId}`);
  }

  async crearComentario(mangaId, texto, idComentarioPadre = null) {
    const queryParams = new URLSearchParams({ texto });
    if (idComentarioPadre) {
      queryParams.append('id_comentario_padre', idComentarioPadre);
    }
    
    return this.request(`/comentarios/${mangaId}?${queryParams.toString()}`, {
      method: 'POST',
    });
  }

  async eliminarComentario(comentarioId) {
    return this.request(`/comentarios/${comentarioId}`, {
      method: 'DELETE',
    });
  }

  async likeComentario(comentarioId) {
    return this.request(`/comentarios/${comentarioId}/like`, {
      method: 'PUT',
    });
  }

  // Método para obtener información del usuario
  async getUserInfo() {
    return this.request('/usuarios/me');
  }
}

// Exportar una instancia única (patrón Singleton)
export const apiService = new ApiService();
export default apiService;