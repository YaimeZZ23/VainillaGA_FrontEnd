// Constantes de la aplicación
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vainillaga-backend.onrender.com';
export const LOGO_URL = `${API_BASE_URL}/logos/logo.png`;

export const ENDPOINTS = {
  // Autenticación
  REGISTER: 'auth/registro',
  LOGIN: 'auth/login',
  
  // Mangas
  MANGAS: 'mangas/',
  MANGA_DETAIL: 'mangas',
  CHAPTERS: 'capitulos',
  
  // Personal
  PERSONAL: 'personal/',
  PERSONAL_MANGA: 'personal',
  RECOMMENDATIONS: 'personal/recomendaciones',
  
  // Usuarios
  USER_INFO: 'usuarios/me',
  
  // Comentarios
  COMMENTS: 'comentarios'
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