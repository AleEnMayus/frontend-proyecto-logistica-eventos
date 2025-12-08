import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../CSS/FormsUser.css";
import { useToast } from '../../hooks/useToast'; // Asegúrate que esta ruta esté bien
import ToastContainer from '../../components/ToastContainer'; // Contenedor visual de los toasts
import api from '../../utils/axiosConfig';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { toasts, addToast, removeToast } = useToast();

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar datos de login al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      const data = res.data;

      if (res.status === 200 && data.user) {
        // Guardamos solo datos no sensibles en localStorage y sessionStorage
        try {
          sessionStorage.setItem('role', data.user.role);
          sessionStorage.setItem('name', data.user.fullName);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
          console.warn('No se pudo guardar datos en almacenamiento local', e);
        }

        addToast('Inicio de sesión exitoso', 'success');
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      // Manejar errores específicos del backend
      let errorMessage = "Error de conexión con el servidor";
      
      if (err.response && err.response.data) {
        const { message, error } = err.response.data;
        
        // Mensajes específicos según el código de error
        switch (error) {
          case "MISSING_CREDENTIALS":
            errorMessage = "Por favor ingresa correo y contraseña";
            break;
          case "INVALID_CREDENTIALS":
            errorMessage = "Correo o contraseña incorrectos";
            break;
          case "ACCOUNT_INACTIVE":
            errorMessage = message || "Tu cuenta está inactiva. Contacta al administrador.";
            break;
          case "DB_ERROR":
            errorMessage = "Error al conectar con la base de datos. Intenta nuevamente.";
            break;
          case "PASSWORD_CHECK_ERROR":
            errorMessage = "Error al validar credenciales. Intenta nuevamente.";
            break;
          case "JWT_ERROR":
            errorMessage = "Error al generar sesión. Intenta nuevamente.";
            break;
          case "UNEXPECTED_ERROR":
            errorMessage = message || "Error inesperado. Intenta nuevamente.";
            break;
          default:
            errorMessage = message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "No se pudo contactar al servidor. Verifica tu conexión.";
      }
      
      addToast(errorMessage, "danger");
      console.error('Error en login:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Volver atrás con el navegador
  const handleGoBackBrowser = () => {
    navigate(`/`);
  };

  return (
    <div className="login-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container">
          <div className="row align-items-center py-3 justify-content-between">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <button onClick={handleGoBackBrowser} className="back-btn me-4 mb-0" title="Volver">
                  ‹
                </button>
                <div className="logo-text">
                  Happy-Art-Events
                </div>
              </div>
            </div>
            <div className="col-6 text-end w-auto">
              <a href="/Register" className="btn-secondary-custom btn">
                Registrarse
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="login-content mt-4 mt-10">
        <div className="login-form-card">
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">
            Accede a tu cuenta de Happy-Art-Events
          </p>

          <form onSubmit={handleSubmit}>
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="tu@ejemplo.com"
              required
              disabled={isLoading}
            />

            <label className="form-label">Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.07 21.07 0 0 1 5.06-6.06" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>

            <div
              className="form-options"
              style={{ width: "100%", marginBottom: "15px", display: "flex", justifyContent: "center" }}
            >
              <Link
                to="/Recover"
                className="forgot-password"
                style={{ display: "block", textAlign: "center" }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>


            <button
              type="submit"
              className="btn-primary-custom"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px 0",
                fontSize: "16px"
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          <div className="divider">O</div>

          <p className="register-link">
            ¿No tienes una cuenta?{' '}
            <a href='/Register'>
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
