import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Componente RegisterForm - Formulario de registro de usuarios
 * Incluye validación de datos y manejo de errores
 */
function RegisterForm() {
  const { register, loading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    clave: '',
    confirmarClave: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Validar email con expresión regular
  // Parámetro: email (string) es el correo a validar. Devuelve true si es válido
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar el formulario antes de enviarlo
  // Parámetro: data (object) con los datos del formulario. Devuelve un objeto de errores
  const validateForm = (data) => {
    const errors = {};

    // Validar nombre de usuario
    if (!data.nombre_usuario.trim()) {
      errors.nombre_usuario = 'El nombre de usuario es requerido';
    } else if (data.nombre_usuario.length < 3) {
      errors.nombre_usuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    // Validar email
    if (!data.correo.trim()) {
      errors.correo = 'El email es requerido';
    } else if (!isValidEmail(data.correo)) {
      errors.correo = 'El email no tiene un formato válido';
    }

    // Validar contraseña
    if (!data.clave) {
      errors.clave = 'La contraseña es requerida';
    } else if (data.clave.length < 6) {
      errors.clave = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!data.confirmarClave) {
      errors.confirmarClave = 'Debes confirmar la contraseña';
    } else if (data.clave !== data.confirmarClave) {
      errors.confirmarClave = 'Las contraseñas no coinciden';
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

    // Preparar datos para la API (sin confirmarClave)
    const { confirmarClave, ...userData } = formData;

    // Intentar registrarse
    try {
      await register(userData);
    } catch (error) {
      // El error se maneja en el contexto de autenticación
      console.error('Error en registro:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-100">
          Crear Cuenta
        </h2>

        {/* Mostrar errores de la API */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Elige tu nombre de usuario"
            />
            {formErrors.nombre_usuario && (
              <p className="text-red-400 text-sm mt-1">{formErrors.nombre_usuario}</p>
            )}
          </div>

          {/* Campo email */}
          <div>
            <label 
              htmlFor="correo" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`input-field w-full ${
                formErrors.correo ? 'border-red-500' : ''
              }`}
              placeholder="tu@email.com"
            />
            {formErrors.correo && (
              <p className="text-red-400 text-sm mt-1">{formErrors.correo}</p>
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
                placeholder="Mínimo 6 caracteres"
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

          {/* Campo confirmar contraseña */}
          <div>
            <label 
              htmlFor="confirmarClave" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmarClave"
                name="confirmarClave"
                value={formData.confirmarClave}
                onChange={handleChange}
                className={`input-field w-full pr-10 ${
                  formErrors.confirmarClave ? 'border-red-500' : ''
                }`}
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {formErrors.confirmarClave && (
              <p className="text-red-400 text-sm mt-1">{formErrors.confirmarClave}</p>
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
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;