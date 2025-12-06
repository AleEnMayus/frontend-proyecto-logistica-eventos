import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import HeaderAdm from "../../../components/HeaderSidebar/HeaderAdm";
import "../../CSS/FormsUser.css";

// Importar el contenedor de toasts y el hook personalizado
import ToastContainer from "../../../components/ToastContainer";
import { useToast } from "../../../hooks/useToast";

const EditAccountPage = () => {
  const { userId } = useParams(); // <-- Obtener ID desde URL
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [formData, setFormData] = useState(null); // null mientras carga
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validación simple
  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "El nombre es obligatorio";
    if (!formData.email) newErrors.email = "El correo es obligatorio";
    if (!formData.documentType)
      newErrors.documentType = "Seleccione un tipo de documento";
    if (!formData.documentNumber)
      newErrors.documentNumber = "El número de documento es obligatorio";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    return newErrors;
  };

  // Traer datos del backend al montar el componente
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get(`/accounts/${userId}`);
        const data = response.data;

        setFormData({
          firstName: data.Names || "",
          email: data.Email || "",
          birthDate: data.BirthDate ? data.BirthDate.slice(0, 10) : "",
          documentType: data.DocumentType || "",
          documentNumber: data.DocumentNumber || "",
          rol: data.Role || "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error(error);
        addToast("Error al cargar los datos de la cuenta", "error");
      }
    };

    if (userId) fetchAccount();
  }, [userId, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const payload = {
          Names: formData.firstName,
          Email: formData.email,
          BirthDate: formData.birthDate,
          DocumentType: formData.documentType,
          DocumentNumber: formData.documentNumber,
          Role: formData.rol,
          Password: formData.password || undefined,
        };

        const response = await api.put(`/accounts/${userId}`, payload);
        addToast("Cuenta actualizada correctamente", "success");

        setTimeout(() => {
          navigate("/ManageAccounts"); // volver al listado
        }, 1000);
      } catch (error) {
        console.error(error);
        addToast(error.response?.data?.error || "Error al actualizar la cuenta", "error");
      }
    }
  };

  if (!formData) return <div>Cargando usuario...</div>;

  return (
    <>
      <HeaderAdm />
      <div className="login-container">
        <div className="login-content">
          <div className="login-form-card" style={{ maxWidth: "800px" }}>
            <h1 className="login-title">EDITAR CUENTA</h1>

            <form onSubmit={handleSubmit}>
              {/* Fila 1: Nombre y Correo */}
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {errors.firstName && <p className="text-danger">{errors.firstName}</p>}
                </div>
                <div className="form-col">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <p className="text-danger">{errors.email}</p>}
                </div>
              </div>

              {/* Fila 2: Fecha y Tipo de documento */}
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="birthDate"
                    className="form-input"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-col">
                  <label className="form-label">Tipo de documento</label>
                  <select
                    name="documentType"
                    className="form-input"
                    value={formData.documentType}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
              </div>

              {/* Fila 3: Número de documento y Rol */}
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Número de documento</label>
                  <input
                    type="text"
                    name="documentNumber"
                    className="form-input"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-col">
                  <label className="form-label">Rol</label>
                  <select
                    name="rol"
                    className="form-input"
                    value={formData.rol}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione</option>
                    <option value="admin">Administrador</option>
                    <option value="user">Cliente</option>
                  </select>
                </div>
              </div>

              {/* Fila 4: Contraseña y Confirmación */}
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Contraseña</label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <span
                      className="toggle-visibility-inside"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.07 21.07 0 0 1 5.06-6.06" />
                          <path d="M1 1l22 22" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>

                <div className="form-col">
                  <label className="form-label">Confirmar contraseña</label>
                  <div className="input-with-icon">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <span
                      className="toggle-visibility-inside"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.07 21.07 0 0 1 5.06-6.06" />
                          <path d="M1 1l22 22" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>


              {/* Botones */}
              <div className="form-actions">
                <button type="button" className="btn-cancel btn" onClick={() => navigate("/ManageAccounts")}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-custom btn">
                  Actualizar Cuenta
                </button>
              </div>
            </form>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditAccountPage;
