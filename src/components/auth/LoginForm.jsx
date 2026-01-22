import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Componente LoginForm - Formulario de inicio de sesión
 * Maneja la autenticación del usuario con validación básica
 */
function LoginForm() {
  const { login, loading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    clave: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validar el formulario antes de enviarlo
  // Parámetro: data (object) con los datos del formulario. Devuelve un objeto con los errores encontrados
  const validateForm = (data) => {
    const errors = {};

    if (!data.nombre_usuario.trim()) {
      errors.nombre_usuario = 'El nombre de usuario es requerido';
    }

    if (!data.clave) {
      errors.clave = 'La contraseña es requerida';
    }

    return errors;
  };

  /**
   * Manejar cambios en los inputs del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
    }

    // Limpiar errores previos
    setFormErrors({});
    clearError();

    // Intentar hacer login
    try {
      await login(formData);
    } catch (error) {
      // El error se maneja en el contexto de autenticación
      console.error('Error en login:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-100">
          Iniciar Sesión
        </h2>

        {/* Mostrar errores de la API */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

      <form   onSubmit={handleSubmit} className="space-y-6">
          {/* Campo nombre de usuario */}
          <div>
            <label 
              htmlFor="nombre_usuario" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="nombre_usuario"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              className={`input-field w-full ${
                formErrors.nombre_usuario ? 'border-red-500' : ''
              }`}
              placeholder="Ingresa tu nombre de usuario"
            />
            {formErrors.nombre_usuario && (
              <p className="text-red-400 text-sm mt-1">{formErrors.nombre_usuario}</p>
            )}
          </div>

          {/* Campo contraseña */}
          <div>
            <label 
              htmlFor="clave" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="clave"
                name="clave"
                value={formData.clave}
                onChange={handleChange}
                className={`input-field w-full pr-10 ${
                  formErrors.clave ? 'border-red-500' : ''
                }`}
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {formErrors.clave && (
              <p className="text-red-400 text-sm mt-1">{formErrors.clave}</p>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Link a registro */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link 
              to="/register" 
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;