import { create } from 'zustand';
import apiService from '../services/api';

//- Basicamente este almacenamiento funciona commo una clase con geters y seters
const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  //- Esta funcion crea el almacenamiento con la informacion del usuario si ahi token guardado
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userInfo = await apiService.getUserInfo();
        set({ user: userInfo, token, isAuthenticated: true, loading: false, error: null });
      } catch (error) {
        localStorage.removeItem('token');
        set({ error: error.message || 'Error al iniciar sesión', loading: false });
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    set({ loading: true });
    try {
      
      
      const response = await apiService.login(credentials);
      const token = response.access_token;
      //- Aqui se esta guardando el token en el navegador
      localStorage.setItem('token', token);
      //- las funciones son claves valor (parte del ) asique tambien ahi que hacer get()
      await get().initializeAuth()
      
    } catch (error) {
      set({ error: error.message || 'Error al iniciar sesión', loading: false });
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      await apiService.register(userData);
      await get().login({
        nombre_usuario: userData.nombre_usuario,
        clave: userData.clave,
      });
    } catch (error) {
      set({ error: error.message || 'Error al registrarse', loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
