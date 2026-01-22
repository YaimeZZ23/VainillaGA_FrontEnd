import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Importar páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MangaDetailPage from './pages/MangaDetailPage';
import ChapterPage from './pages/ChapterPage';
import PersonalListPage from './pages/PersonalListPage';
import RecommendationsPage from './pages/RecommendationsPage';
import BusquedaPage from './pages/BusquedaPage';

// Componente de carga inicial
import Loading from './components/common/Loading';

/**
 * Componente ProtectedRoute - Protege rutas que requieren autenticación
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const loading = useAuthStore(state => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loading message="Verificando autenticación..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Componente principal de la aplicación
 * Configura el router y las rutas principales
 */
function App() {
  const loading = useAuthStore(state => state.loading);

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
    // Debug: log el estado inicial
    console.log('AuthStore INIT', useAuthStore.getState());
  }, []);

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '2rem'}}>Cargando...</div>;
  }

  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/manga/:id" element={<MangaDetailPage />} />
        <Route path="/manga/:mangaId/chapter/:chapterId" element={ <ChapterPage />} />
        <Route path="/buscar" element={<BusquedaPage />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/personal" 
          element={
            <ProtectedRoute>
              <PersonalListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;