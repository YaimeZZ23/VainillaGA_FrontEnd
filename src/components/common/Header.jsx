import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { LOGO_URL } from '../../utils/constants';

/**
 * Componente Header - Barra de navegación principal
 * Incluye navegación responsive y manejo de autenticación
 */
function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const path = window.location.pathname
  /**
   * Manejar el logout del usuario
   */
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  /**
   * Cerrar el menú móvil
   */
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-dark-800 border-b border-dark-600 text-lg">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/** Logo, cuando se le da click se va a "/" y se cierra el menu resposive del header */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-[32px] font-bold text-primary-400"
            onClick={closeMenu}
          >
            <img
              src={LOGO_URL}
              alt="Logo VainillaGA"
              className="h-16 w-16 object-cover rounded-full border-2 border-primary-700 shadow-lg"
            />
            <span className="hidden sm:inline">VainillaGA</span>
          </Link>

          {/* Navegación desktop, no ahi menu resposive, solo se activa si es hidden md,
          pantallas medianas o grandes.
          md:flex significa que en pantallas medianas (min-width: 768px) se aplica flex. 
          Antes de eso (sm o xs) está oculto.*/}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors"
            >
              <span>Inicio</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/personal" 
                  className="flex items-center space-x-1 text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Mi Lista</span>
                </Link>
                
              </>
            )}

            <Link 
              to="/buscar"
              className="btn-secondary flex items-center space-x-2"
            >
              <span>Buscar mangas</span>
            </Link>

            {/* Usuario autenticado */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Hola, {user?.nombre_usuario}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          {/*setIsMenuOpen(!isMenuOpen) significa: “si estaba abierto, ciérralo; 
            si estaba cerrado, ábrelo”*/}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-primary-400"
          >
            {/* Estas son clases visuales de react */}
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            )  : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menú móvil los md:hidden solo se ven en pantallas pequeñas*/}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-700 border-dark-600 rounded-lg m-4 pb-3 pt-3">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors px-4"
                onClick={closeMenu}
              >
                <span>Inicio</span>
              </Link>
              
              {isAuthenticated && (
                <>
                {/* En todos al clickar se cierra el menu porque al ser un componente independiente
                se quedaria abierto sino */}
                  <Link 
                    to="/personal" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors px-4"
                    onClick={closeMenu}
                  >
                    <HeartIcon className="h-5 w-5" />
                    <span>Mi Lista</span>
                  </Link>
                  
                  <a 
                    href="#recomendaciones" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors px-4"
                    onClick={closeMenu}
                  >
                    <span>Recomendaciones</span>
                  </a>
                </>
              )}

              <Link 
                to="/buscar"
                className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors px-4"
                onClick={closeMenu}
              >
                <span>Buscar mangas</span>
              </Link>

              {isAuthenticated ? (
                <div className="border-t border-dark-600 pt-4 px-4">
                  <p className="text-gray-400 mb-2">
                    Hola, {user?.nombre_usuario}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Deslogearse</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-dark-600 pt-4 px-4 space-y-2">
                  <Link 
                    to="/login" 
                    className="block text-gray-300 hover:text-primary-400 transition-colors"
                    onClick={closeMenu}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className="block btn-primary text-center"
                    onClick={closeMenu}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;


//- RESUMEN HEADER: Basicamente se separa en:
//-  La parte del logo y el nombre que es un boton para volver a incio 
//- Y ahora se separa en la parte de vista de ordenador que pone todos los links al resto de 
//- de paginas (logueo, recomendaciones...) directamente
//- y la vista de movil que con una pestaña flotante que se abre y se cierra con los mismos links
//- Tambien ahi un div que es para la logica de abrir y cerrar la pestaña 
//-  junto con la vista del boton (puntos o x)