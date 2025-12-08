import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import "../../../Views/CSS/Modals.css";
import RequestModal from '../RequestModal';
import api from '../../../utils/axiosConfig';

//  Importar el hook y el contenedor de toasts
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";

const API_FIELD_MAPPING = {
  fullName: "Names",
  birthDate: "BirthDate",
  photo: "Photo",
  identificationType: "DocumentType",
  documentNumber: "DocumentNumber",
};

const EditModal = ({ isOpen, onClose, user, onSave }) => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalUser, setOriginalUser] = useState({});
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Función para obtener la foto de perfil
  const fetchProfilePhoto = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) throw new Error("No se encontró información del usuario.");

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id || parsedUser.UserId;
      if (!userId) throw new Error("No se encontró el ID del usuario.");

      const res = await api.get(`/pfp/${userId}`);
      const data = res.data;
      setPhotoUrl(data.url);

      // Actualizar también el formData con la nueva URL
      setFormData(prev => ({ ...prev, photo: data.url }));
    } catch (err) {
      console.error("Error obteniendo la foto de perfil:", err);
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Llamar al cargar el componente
  useEffect(() => {
    fetchProfilePhoto();
  }, []);

  // Efecto inicial - cargar datos del usuario y foto
  useEffect(() => {
    if (!isOpen) return;

    const loadUserData = async () => {
      setLoading(true);

      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id || parsedUser.UserId;

        // Cargar datos del perfil desde el servidor usando axios (cookies)
        const res = await api.get(`/profile/${userId}`);

        if (res.status === 200) {
          const serverData = res.data;

          // Combinar datos del servidor con sessionStorage
          const initialData = {
            fullName: serverData.Names || parsedUser.fullName || parsedUser.Names || "",
            email: serverData.Email || parsedUser.email || parsedUser.Email || "",
            birthDate: serverData.BirthDate
              ? serverData.BirthDate.split("T")[0]
              : parsedUser.birthDate
                ? parsedUser.birthDate.split("T")[0]
                : parsedUser.BirthDate
                  ? parsedUser.BirthDate.split("T")[0]
                  : "",
            identificationType: serverData.DocumentType || parsedUser.identificationType || parsedUser.DocumentType || "",
            documentNumber: serverData.DocumentNumber || parsedUser.documentNumber || parsedUser.DocumentNumber || "",
            photo: serverData.url || serverData.Photo || parsedUser.photo || parsedUser.Photo || "",
          };

          setFormData(initialData);
          setOriginalUser(initialData);

          // Si hay URL de foto del servidor, usarla
          if (serverData.url) {
            setPhotoUrl(serverData.url);
          }

          // Actualizar sessionStorage con datos frescos del servidor
          const updatedUser = { ...parsedUser, ...serverData };
          try { sessionStorage.setItem("user", JSON.stringify(updatedUser)); } catch(e) { console.warn('sessionStorage set failed', e); }
        } else {
          // Si falla el fetch, usar datos de sessionStorage
          const initialData = {
            fullName: parsedUser.fullName || parsedUser.Names || "",
            email: parsedUser.email || parsedUser.Email || "",
            birthDate: parsedUser.birthDate
              ? parsedUser.birthDate.split("T")[0]
              : parsedUser.BirthDate
                ? parsedUser.BirthDate.split("T")[0]
                : "",
            identificationType: parsedUser.identificationType || parsedUser.DocumentType || "",
            documentNumber: parsedUser.documentNumber || parsedUser.DocumentNumber || "",
            photo: parsedUser.photo || parsedUser.Photo || parsedUser.profilePicture || "",
          };

          setFormData(initialData);
          setOriginalUser(initialData);
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);

        // Fallback: usar localStorage si hay error de red
        try {
          const parsedUser = JSON.parse(storedUser);
          const initialData = {
            fullName: parsedUser.fullName || parsedUser.Names || "",
            email: parsedUser.email || parsedUser.Email || "",
            birthDate: parsedUser.birthDate
              ? parsedUser.birthDate.split("T")[0]
              : parsedUser.BirthDate
                ? parsedUser.BirthDate.split("T")[0]
                : "",
            identificationType: parsedUser.identificationType || parsedUser.DocumentType || "",
            documentNumber: parsedUser.documentNumber || parsedUser.DocumentNumber || "",
            photo: parsedUser.photo || parsedUser.Photo || parsedUser.profilePicture || "",
          };

          setFormData(initialData);
          setOriginalUser(initialData);
        } catch (parseErr) {
          console.error("Error al parsear localStorage:", parseErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isOpen]);

  if (!isOpen) return null;

  const stopPropagation = (e) => e.stopPropagation();
  const role = user?.role || "user";
  const rolLegible = role === "admin" ? "Administrador" : "Cliente";

  // Validaciones
  const validateField = (name, value) => {
    let error = "";

    if (name === "fullName" && (!value || value.trim().length < 3)) {
      error = "El nombre debe tener al menos 3 caracteres.";
    }

    if (name === "documentNumber" && value && !/^[0-9]+$/.test(value)) {
      error = "El número de documento debe contener solo números.";
    }

    if (name === "photo" && value && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
      error = "La URL debe ser una imagen válida.";
    }

    if (name === "birthDate" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const isMinor =
        age < 18 ||
        (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

      if (isMinor) {
        error = "Debes ser mayor de edad (mínimo 18 años).";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Guardar cambios
  const handleSaveChanges = async () => {
    try {
      //  Validar antes de enviar
      Object.keys(formData).forEach((key) => validateField(key, formData[key]));
      const hasErrors = Object.values(errors).some((err) => err);

      // Validar campos obligatorios
      const requiredFields = ["fullName", "birthDate", "identificationType", "documentNumber"];
      const emptyFields = requiredFields.filter(
        (f) => !formData[f] || formData[f].trim() === ""
      );

      if (emptyFields.length > 0) {
        addToast("Por favor, completa todos los campos obligatorios antes de guardar.", "danger");
        return;
      }

      if (hasErrors) {
        addToast("Por favor, corrige los errores antes de guardar.", "danger");
        return;
      }

      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        addToast("No se encontró información del usuario.", "danger");
        onClose();
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id;
      if (!userId) {
        addToast("No se pudo encontrar el ID del usuario.", "danger");
        onClose();
        return;
      }

      const changes = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalUser[key]) {
          const apiFieldName = API_FIELD_MAPPING[key];
          if (apiFieldName) {
            changes[apiFieldName] = formData[key];
          }
        }
      });

      if (Object.keys(changes).length === 0) {
        addToast("No se detectaron cambios para guardar.", "warning");
        onClose();
        return;
      }

      //  Enviar actualización
      const res = await api.put(`/profile/${userId}`, changes);

      if (res.status === 200) {
        const updatedUser = { ...parsedUser, ...formData };
        try { sessionStorage.setItem("user", JSON.stringify(updatedUser)); } catch(e) { console.warn('sessionStorage set failed', e); }

        addToast("Perfil actualizado correctamente.", "success");

        if (onSave) onSave(updatedUser);
        setOriginalUser(formData);

        setTimeout(() => onClose(), 2000);
      } else {
        const errorData = res.data || {};
        addToast(errorData.message || "Error al actualizar el perfil.", "danger");
      }
    } catch (error) {
      console.error("Error de red o conexión:", error);
      addToast("Error de conexión con el servidor.", "danger");
    }
  };

  // Subir imagen al backend
  const handleFileButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith("image/")) {
      addToast("El archivo debe ser una imagen.", "danger");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast("La imagen no debe superar 2MB.", "danger");
      return;
    }

    // Obtener usuario actual del localStorage
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      addToast("No se encontró información del usuario.", "danger");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser.id;
    if (!userId) {
      addToast("No se pudo encontrar el ID del usuario.", "danger");
      return;
    }

    // Crear el FormData para el envío del archivo
    const fd = new FormData();
    fd.append("photo", file);

    try {
      setUploading(true);

      const res = await api.post(`/pfp/${userId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data;
      const newUrl = data.url;

      // Actualizar sessionStorage
      const updatedUser = { ...parsedUser, photo: newUrl, Photo: newUrl };
      try { sessionStorage.setItem("user", JSON.stringify(updatedUser)); } catch(e) { console.warn('sessionStorage set failed', e); }

      // Actualizar estado local
      setPhotoUrl(newUrl);
      setFormData(prev => ({ ...prev, photo: newUrl }));

      addToast("Foto de perfil actualizada correctamente.", "success");

      // Llamar a onSave para actualizar el componente padre si existe
      if (onSave) onSave(updatedUser);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      addToast(err.message || "Error al subir la imagen.", "danger");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Determinar qué foto mostrar
  const displayPhoto = photoUrl || formData.photo;

  return (
    <>
      <div className="sidebar-overlay active" onClick={onClose}>
        <div className="profile-modal w-800" onClick={stopPropagation}>
          <button className="close-btn" onClick={onClose}>×</button>
          <h4 className="modal-title text-center mb-3">Editar Perfil</h4>

          <div className="pm-body-profile pm-body d-flex flex-wrap">
            {/* Foto */}
            <div className="pm-photo">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <span>Cargando...</span>
                </div>
              ) : displayPhoto ? (
                <>
                  <img
                    src={displayPhoto}
                    alt="Avatar del usuario"
                    className="img-pf rounded-circle"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setPhotoUrl(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleFileButtonClick}
                    disabled={uploading}
                    title="Cambiar foto"
                    className="btn-edit-photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0e40b6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="90px"
                    viewBox="0 -960 960 960"
                    width="90px"
                    fill="#0e40b68b"
                  >
                    <path d="M222-255q63-40 124.5-60.5T480-336q72 0 134 20.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Z" />
                  </svg>
                  <button
                    type="button"
                    onClick={handleFileButtonClick}
                    disabled={uploading}
                    title="Subir foto"
                    className="btn-edit-photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0e40b6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>
                </>
              )}

              {uploading && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '10px',
                    borderRadius: '5px',
                  }}
                >
                  Subiendo...
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            {/* Campos */}
            <div className="pm-fields" style={{ maxWidth: "800px" }}>
              <div className="field-row">
                <div className="field">
                  <div className="badge bg-secondary small">{rolLegible}</div>
                </div>
              </div>

              {/* Campos de usuario */}
              <div className="field-row">
                <div className="field">
                  <div className="field-label">Nombre completo *</div>
                  <input
                    type="text"
                    name="fullName"
                    className="field-value"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                  />
                  {errors.fullName && <small className="error-text">{errors.fullName}</small>}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <div className="field-label">
                    Correo <span className="text-muted ms-2">(Campo protegido)</span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="field-value field-disabled"
                    value={formData.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <div className="field-label">Fecha de nacimiento *</div>
                  <input
                    type="date"
                    name="birthDate"
                    className="field-value"
                    value={formData.birthDate || ''}
                    onChange={handleInputChange}
                  />
                  {errors.birthDate && <small className="error-text">{errors.birthDate}</small>}
                </div>
              </div>

              <div className="field-row two-cols">
                <div className="field">
                  <div className="field-label">
                    Tipo de documento *
                    {role === "user" && <span className="text-muted ms-2">(Campo protegido)</span>}
                  </div>
                  <select
                    name="identificationType"
                    className={`field-value ${role === "user" ? "field-disabled" : ""}`}
                    value={formData.identificationType || ''}
                    onChange={handleInputChange}
                    disabled={role === "user"}
                  >
                    <option value="">Seleccionar</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </div>

                <div className="field">
                  <div className="field-label">
                    Número de documento *
                    {role === "user" && <span className="text-muted ms-2">(Campo protegido)</span>}
                  </div>
                  <input
                    type="text"
                    name="documentNumber"
                    className={`field-value ${role === "user" ? "field-disabled" : ""}`}
                    value={formData.documentNumber || ''}
                    onChange={handleInputChange}
                    disabled={role === "user"}
                  />
                  {errors.documentNumber && <small className="error-text">{errors.documentNumber}</small>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pm-footer d-flex flex-column gap-2">
            <button
              className="btn-primary-custom btn w-100"
              onClick={handleSaveChanges}
              disabled={uploading}
            >
              Guardar Cambios
            </button>

            <button
              className="btn-secondary-custom btn w-100"
              onClick={() => {
                onClose();
                navigate("/UpdatePassword");
              }}
            >
              Cambiar contraseña
            </button>

            {role === "user" && (
              <button className="btn-secondary-custom btn w-100" onClick={() => setRequestModalOpen(true)}>
                Solicitar cambio de documento
              </button>
            )}
          </div>
        </div>
      </div>

      {isRequestModalOpen && (
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          user={user}
          requestType="document_change"
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default EditModal;