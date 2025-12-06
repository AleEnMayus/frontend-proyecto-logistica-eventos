import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import "../CSS/FormsUser.css";

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = JSON.parse(storedUser);
  const userId = user.id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const validatePassword = (password) => {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return re.test(password);
    };

    if (!validatePassword(formData.newPassword)) {
      setError('La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo.');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.put(`/password/${userId}/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      const data = response.data;
      setSuccess('Contraseña actualizada exitosamente');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBackBrowser = () => {
    window.history.back();
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <div className="login-container">
      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container">
          <div className="row align-items-center py-3">
            <div className="col-6">
              <div className="d-flex align-items-center justify-content-center">
                <button onClick={handleGoBackBrowser} className="back-btn mb-0 me-4" title="Volver">
                  ←
                </button>
                <div className="logo-text">
                  Happy-Art-Events
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="login-content container mt-4">
        <div className="login-form-card form-card-500">
          <h1 className="login-title">Actualizar Contraseña</h1>
          <p className="login-subtitle">
            Cambia tu contraseña por una más segura
          </p>

          {/* Contenedor con altura fija para mensajes */}
          <div style={{ minHeight: '60px', marginBottom: '1rem' }}>
            {error && (
              <div className="alert alert-danger w-100" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success w-100" role="alert">
                {success}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 position-relative input-with-icon">
              <label className="form-label">Contraseña actual</label>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Escribe tu contraseña actual"
                required
                disabled={isLoading}
              />
              <span
                className="toggle-visibility-inside"
                onClick={() => togglePasswordVisibility('current')}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {showCurrentPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.07 21.07 0 0 1 5.06-6.06" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </span>
            </div>

            <div className="mb-3 position-relative input-with-icon">
              <label className="form-label">Nueva Contraseña</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Escribe tu nueva contraseña (mín. 8 caracteres)"
                required
                disabled={isLoading}
                minLength="8"
              />
              <span
                className="toggle-visibility-inside"
                onClick={() => togglePasswordVisibility('new')}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {showNewPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.07 21.07 0 0 1 5.06-6.06" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </span>
            </div>

            <div className="mb-3 position-relative input-with-icon">
              <label className="form-label">Confirmar Contraseña</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirma tu nueva contraseña"
                required
                disabled={isLoading}
              />
              <span
                className="toggle-visibility-inside"
                onClick={() => togglePasswordVisibility('confirm')}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.07 21.07 0 0 1 5.06-6.06" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary-custom btn"
              style={{ width: "100%", padding: "12px 0" }}
              disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              {isLoading ? 'Actualizando...' : 'Confirmar nueva contraseña'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;