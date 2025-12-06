import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import '../CSS/FormsUser.css';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [codeTimer, setCodeTimer] = useState(0);

  const { toasts, addToast, removeToast } = useToast();
  const codeRefs = useRef([]);

  // Temporizador del código
  useEffect(() => {
    if (codeTimer <= 0) return;
    const interval = setInterval(() => {
      setCodeTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [codeTimer]);

  // Limpieza de datos sensibles al desmontar
  useEffect(() => {
    return () => {
      setNewPassword('');
      setConfirmPassword('');
      setCode(Array(6).fill(''));
    };
  }, []);

  const handleCodeChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < code.length - 1) {
        codeRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setErrorMessage('Por favor ingresa tu correo.');
      return;
    }

    setCodeTimer(180); // 3 minutos

    try {
      const response = await api.post('/password/send-code', { email });
      const data = response.data;

      addToast(data.message || 'Código enviado', 'success');
      setErrorMessage('');
      setCodeTimer(120); // CAMBIO: ahora son 2 minutos (120 segundos)
    } catch (error) {
      setCodeTimer(0);
      setErrorMessage(error.response?.data?.message || 'Error al enviar el código');
      addToast(error.response?.data?.message || 'Error al enviar el código', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.some((digit) => digit === '')) {
      setErrorMessage('Por favor ingresa el código completo.');
      return;
    }

    const validatePassword = (password) => {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return re.test(password);
    };

    if (!validatePassword(newPassword)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await api.post('/password/reset-password', {
        email,
        code: code.join(''),
        newPassword,
      });

      addToast('Contraseña actualizada exitosamente', 'success');
      setErrorMessage('');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al actualizar la contraseña');
      addToast(error.response?.data?.message || 'Error al actualizar la contraseña', 'error');
    }
  };

  const handleGoBackBrowser = () => {
    window.history.back();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="login-container">
      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container">
          <div className="row align-items-center py-3">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <button onClick={handleGoBackBrowser} className="back-btn me-4 mb-0" title="Volver">
                  ←
                </button>
                <div className="logo-text">Happy-Art-Events</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="login-content container mt-4">
        <div className="login-form-card form-card-500">
          <h1 className="login-title">Recuperar Contraseña</h1>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* Correo */}
            <div className="form-group mb-3">
              <label>Correo</label>
              <div className="d-flex">
                <input
                  type="email"
                  className="form-input me-2"
                  placeholder="example.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-send-code"
                  onClick={handleSendCode}
                  disabled={codeTimer > 0}
                >
                  {codeTimer > 0 ? `Reenviar en ${formatTime(codeTimer)}` : 'Enviar código'}
                </button>
              </div>
            </div>

            {/* Código de verificación */}
<div className="form-group text-center mb-4">
  <label className="d-block mb-3 fw-semibold fs-5">
    Ingresa el código de verificación
  </label>

  <div className="d-flex justify-content-center gap-1 flex-wrap">
    {code.map((digit, index) => (
      <input
        key={index}
        ref={(el) => (codeRefs.current[index] = el)}
        type="tel"
        pattern="[0-9]*"
        inputMode="numeric"
        maxLength="1"
        value={digit}
        onChange={(e) => handleCodeChange(index, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && !code[index] && index > 0) {
            codeRefs.current[index - 1]?.focus();
          }
        }}
        className="form-control text-center fw-bold"
        style={{
          width: "35px",
          height: "35px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
    ))}
  </div>
</div>

            {/* Nueva contraseña */}
            <div className="form-group mb-3 password-group">
              <label>Nueva Contraseña</label>
              <div className="input-with-icon">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-visibility-inside"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
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
                </span>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="form-group mb-4 password-group">
              <label>Confirmar Contraseña</label>
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-visibility-inside"
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
                </span>
              </div>
            </div>

            <button type="submit" className="btn-primary-custom w-100">
              Confirmar nueva contraseña
            </button>
          </form>
        </div>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default RecoverPassword;