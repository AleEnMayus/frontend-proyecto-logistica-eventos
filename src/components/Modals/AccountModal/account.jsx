import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Views/CSS/Modals.css";
import api from '../../../utils/axiosConfig';

const PerfilModal = ({ isOpen, onClose, onEdit }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadUserData = async () => {
      setLoading(true);

      // Primero cargar desde sessionStorage (instantáneo)
      try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser); // Mostrar datos inmediatamente
        }
      } catch (error) {
        console.error("Error al parsear sessionStorage:", error);
      }

      // Obtener el userId desde sessionStorage
      let userId = null;
      try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id; // sessionStorage usa 'id'
        }
      } catch (error) {
        console.error("Error al obtener userId:", error);
      }

      if (!userId) {
        console.error("No se encontró userId en sessionStorage");
        setLoading(false);
        onClose();
        return;
      }

      // Actualizar desde el backend usando /profile/{userId}
      try {
        const profileRes = await api.get(`/profile/${userId}`);

        if (profileRes.status === 200) {
          const serverData = profileRes.data;

          // Mapear los campos de la API al formato del frontend
          const normalized = {
            id: serverData.UserId || userId, // API devuelve 'UserId'
            fullName: serverData.Names || "",
            email: serverData.Email || "",
            birthDate: serverData.BirthDate ? serverData.BirthDate.split("T")[0] : "",
            identificationType: serverData.DocumentType || "",
            documentNumber: serverData.DocumentNumber || "",
            photo: serverData.Photo || "",
            role: serverData.Role || "",
            status: serverData.Status || "",
          };

          setUser(normalized);
          sessionStorage.setItem("user", JSON.stringify(normalized));
        }
      } catch (profileErr) {
        console.error("Error al cargar /profile:", profileErr);

        // Si falla, mantener los datos de sessionStorage
        try {
          const storedUser = sessionStorage.getItem('user');
          if (!storedUser) {
            console.error("No hay datos de respaldo en sessionStorage");
            onClose();
          }
        } catch (e) {
          console.error("Error crítico:", e);
          onClose();
        }
      }

      setLoading(false);
    };

    loadUserData();
  }, [isOpen, onClose]);

  // Nota: no retornar aquí para no romper el orden de Hooks; manejamos el render más abajo

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
      setProfilePhotoUrl(data.url);
    } catch (err) {
      console.error("Error obteniendo la foto de perfil:", err);
      setProfilePhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Llamar a la foto cuando el modal se abra (mantener el hook en el mismo orden siempre)
  useEffect(() => {
    if (isOpen) fetchProfilePhoto();
  }, [isOpen]);

  const stop = (e) => e.stopPropagation();

  // Si el modal no está abierto, no renderices nada (esto ahora está después de declarar todos los hooks)
  if (!isOpen) {
    return null;
  }

  // Acceso seguro a las propiedades del objeto 'user' con valores por defecto
  const {
    fullName = "",
    email = "",
    birthDate = "",
    identificationType = "",
    documentNumber = "",
    photo = "",
    role = "",
  } = user;

  // Construir URL completa de la foto si existe (prefiere la URL cargada desde /pfp)
  const fullPhotoUrl = profilePhotoUrl || (photo ? `${api.defaults.baseURL}/${photo}` : "");

  const onlyDate = birthDate || "";

  const rolLegible = role === "admin" ? "Administrador" : "Cliente";

  return (
    <>
    <div className="sidebar-overlay active" onClick={onClose}>
      <div>
        <div
          className="profile-modal w-800"
          onClick={stop}
          role="dialog"
          aria-modal="true"
        >
          <button className="close-btn" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>

          <h4 className="modal-title text-center mb-3">Detalles del Perfil</h4>

          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}

          <div className="pm-body d-flex flex-wrap">
            {fullPhotoUrl ? (
              <img
                src={fullPhotoUrl}
                alt="Avatar del usuario"
                className="img-pf rounded-circle"
                onError={(e) => {
                  console.error("Error al cargar imagen:", fullPhotoUrl);
                  e.target.style.display = "none";
                  const svg = e.target.nextElementSibling;
                  if (svg) svg.style.display = "block";
                }}
              />
            ) : null}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="50px"
              viewBox="0 -960 960 960"
              width="50px"
              fill="#0e40b68b"
              style={{ display: fullPhotoUrl ? "none" : "block" }}
            >
              <path d="M222-255q63-40 124.5-60.5T480-336q72 0 134 20.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm-.21 370q-83.15 0-156.28-31.5t-127.22-86Q142-252 111-324.84 80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.5t-127.13 86Q562.74-80 479.6-80Z" />
            </svg>
          </div>

          <div className="pm-fields">
            <div className="field-row">
              <div className="field">
                <div className="badge bg-secondary small mt-3">
                  {rolLegible}
                </div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <div className="field-label">Nombre completo</div>
                <div className="field-value">{fullName || "—"}</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <div className="field-label">Correo</div>
                <div className="field-value">{email || "—"}</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <div className="field-label">Fecha de nacimiento</div>
                <div className="field-value">{onlyDate || "—"}</div>
              </div>
            </div>

            <div className="field-row two-cols">
              <div className="field">
                <div className="field-label">Tipo de documento</div>
                <div className="field-value">{identificationType || "—"}</div>
              </div>
              <div className="field">
                <div className="field-label">Número de documento</div>
                <div className="field-value">{documentNumber || "—"}</div>
              </div>
            </div>
          </div>
          <div className="pm-footer">
          <button
            className="btn-primary-custom btn w-100"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            Editar perfil
          </button>
          <button
            className="btn-secondary-custom btn w-100"
            onClick={() => {
              onClose();
              navigate("/Logout");
            }}
          >
            Cerrar sesión
          </button>
        </div>
        </div>
      </div>
    </div >
    </>
  );
};

export default PerfilModal;