import React from 'react';
import Header from './Header';

// Componente Layout: estructura base de la aplicación
// Proporciona el header y el contenedor principal para todas las páginas
// Parámetro: children (object) representa los componentes hijos a renderizar
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;