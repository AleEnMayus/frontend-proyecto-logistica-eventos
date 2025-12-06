import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import '../CSS/FormsUser.css';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import TermsModal from "../../components/Modals/TermsConditions";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    identificationType: '',
    documentNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { toasts, addToast, removeToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  Validación de términos
    const terms = document.getElementById("acceptTerms");
    if (!terms.checked) {
      addToast("Debes aceptar los términos y condiciones", "danger");
      return;
    }

    if (!validateEmail(formData.email)) {
      addToast('El correo no tiene un formato válido', 'danger');
      return;
    }

    if (!validatePassword(formData.password)) {
      addToast('La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo.', 'danger');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    if (!formData.birthDate || formData.birthDate.trim() === "") {
      addToast('Debes ingresar tu fecha de nacimiento', 'danger');
      return;
    }

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      addToast('Debes ser mayor de 18 años para registrarte', 'danger');
      return;
    }

    if (formData.documentNumber.length < 10 || formData.documentNumber.length > 20) {
      addToast('El número de documento debe tener entre 10 y 20 caracteres', 'danger');
      return;
    }

    const formattedData = {
      ...formData,
      birthDate: new Date(formData.birthDate).toISOString().slice(0, 10)
    };

    try {
      const response = await api.post('/auth/register', formattedData);
      const data = response.data;

      addToast('Registro exitoso. Ahora puedes iniciar sesión.', 'success');

      setFormData({
        fullName: '',
        birthDate: '',
        identificationType: '',
        documentNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      addToast(error.response?.data?.message || 'Error en el registro', 'danger');
    }
  };

  const handleGoBackBrowser = () => {
    window.history.back();
  };

  return (
    <div className="login-container p-0">
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
              <a href="/login" className="btn-secondary-custom btn">
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="login-content container mt-4 mt-10">
        <div className="login-form-card w-800">
          <h1 className="login-title">Registrarse</h1>
          <p className="login-subtitle">
            Crea tu cuenta en Happy-Art Eventos
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Tipo de Identificación</label>
                <select
                  name="identificationType"
                  value={formData.identificationType}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PP">Permiso de permanencia</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Número de Documento</label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="row">
              {/* CONTRASEÑA 1 */}
              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Crear una contraseña"
                    required
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
              </div>

              {/* CONFIRMAR CONTRASEÑA */}
              <div className="col-md-6">
                <label className="form-label">Confirmar Contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Repetir la contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
              </div>
            </div>

            {/* CHECKBOX PERSONALIZADO */}
            <div className="mt-3" style={{ display: "flex", justifyContent: "center" }}>
              <label className="checkbox-wrapper">
                <input type="checkbox" id="acceptTerms" className="custom-checkbox" />
                <span className="checkmark"></span>
                <span style={{ marginLeft: "8px" }}>
                  Acepto los{" "}
                  <span
                    style={{ cursor: "pointer", textDecoration: "underline", color: "rgb(21,165,231)" }}
                    onClick={() => setShowTermsModal(true)}
                  >
                    Términos y Condiciones
                  </span>
                </span>
              </label>
            </div>


            <button type="submit" className="btn-primary-custom mt-4 w-100">
              Registrarse
            </button>
          </form>
        </div>
      </div>

      {/*  MODAL LISTO */}
      {showTermsModal && (
        <TermsModal onClose={() => setShowTermsModal(false)} />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default RegisterPage;
