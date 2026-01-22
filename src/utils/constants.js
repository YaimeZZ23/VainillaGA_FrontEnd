// Constantes de la aplicación
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const LOGO_URL = `${API_BASE_URL}/logos/logo.png`;

export const ENDPOINTS = {
  // Autenticación
  REGISTER: 'api/auth/registro',
  LOGIN: 'api/auth/login',
  
  // Mangas
  MANGAS: 'api/mangas/',
  MANGA_DETAIL: 'api/mangas',
  CHAPTERS: 'api/capitulos',
  
  // Personal
  PERSONAL: 'api/personal/',
  PERSONAL_MANGA: 'api/personal',
  RECOMMENDATIONS: 'api/personal/recomendaciones',
  
  // Usuarios
  USER_INFO: 'api/usuarios/me',
  
  // Comentarios
  COMMENTS: 'api/comentarios'
};

export const MANGA_STATES = {
  READING: 'leyendo',
  COMPLETED: 'completado',
  PENDING: 'pendiente',
  DROPPED: 'abandonado'
};

export const MANGA_TYPES = {
  MANGA: 'manga',
  MANHWA: 'manhwa',
  MANHUA: 'manhua',
  ONE_SHOT: 'OneShot'
};