import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { Link } from 'react-router-dom';
import PerfilModal from '../Modals/AccountModal/account';
import EditModal from "../Modals/AccountModal/EditAccount";

const HeaderCl = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openComponent, setOpenComponent] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    photo: null,
  });

  useEffect(() => {
    // Prefer localStorage (persisted) but fall back to sessionStorage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) setUserData(JSON.parse(storedUser));

    const handleStorageChange = (event) => {
      if (event.key === "user") {
        setUserData(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSaveProfile = (updatedData) => {
    const updatedUser = { ...userData, ...updatedData };
    setUserData(updatedUser);
    try { sessionStorage.setItem('user', JSON.stringify(updatedUser)); } catch(e){ console.warn('sessionStorage set failed', e); }
    console.log("Perfil actualizado:", updatedUser);
  };

  const toggleUserMenu = () => setIsUserMenuOpen(prev => !prev);
  const toggleMenu = () => setOpenComponent(prev => prev === "sidebar" ? null : "sidebar");
  const openPerfil = () => setOpenComponent("perfil");

  const fetchProfilePhoto = async () => {
    try {
      // Buscar usuario en localStorage o sessionStorage
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!storedUser) {
        // No hay usuario: no es un error crítico, simplemente no mostramos foto
        setPhotoUrl(null);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id || parsedUser.UserId || parsedUser._id;
      if (!userId) {
        setPhotoUrl(null);
        setLoading(false);
        return;
      }

      // Intentar obtener la foto. Ser tolerante con diferentes formatos de respuesta.
      const res = await api.get(`/pfp/${userId}`);
      const data = res.data;

      // Casos comunes: { url: 'http://...' } | 'http://...' | { photo: '<base64>' }
      if (!data) {
        setPhotoUrl(null);
      } else if (typeof data === 'string') {
        setPhotoUrl(data);
        setFormData(prev => ({ ...prev, photo: data }));
      } else if (data.url) {
        setPhotoUrl(data.url);
        setFormData(prev => ({ ...prev, photo: data.url }));
      } else if (data.photo) {
        // Si backend devuelve base64 sin prefijo
        const base = data.photo.startsWith('data:') ? data.photo : `data:image/jpeg;base64,${data.photo}`;
        setPhotoUrl(base);
        setFormData(prev => ({ ...prev, photo: base }));
      } else if (data.path) {
        setPhotoUrl(data.path);
        setFormData(prev => ({ ...prev, photo: data.path }));
      } else {
        // Intenta convertir objeto a URL si contiene campos conocidos
        const possible = Object.values(data).find(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:')));
        setPhotoUrl(possible || null);
        if (possible) setFormData(prev => ({ ...prev, photo: possible }));
      }
    } catch (err) {
      // Log con más contexto para ayudar a depurar, pero no romper UI
      console.debug("fetchProfilePhoto error:", err.response?.data || err.message || err);
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };
    
      // Llamar al cargar el componente
      useEffect(() => {
        fetchProfilePhoto();
      }, []);
  
    const userImageUrl = photoUrl || null;

  const getUserLabel = () => {
    if (userData?.role === 'admin') return 'admin';
    if (userData) return 'Cliente';
    return '?';
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container d-flex justify-content-between align-items-center py-3">

          {/* Izquierda: Menú + Logo */}
          <div className="d-flex align-items-center">
            <button className="menu-btn me-3" onClick={toggleMenu}>
              ☰
            </button>
            <a href="/" className="d-flex logolink">
              <img src="/Logo-White.png" className="img-50" alt="Logo" />
              <div className="logo-text">Happy-Art-Events</div>
            </a>
          </div>

          {/* Derecha: Notificaciones + Menú de Usuario */}
          <div className="d-flex align-items-center gap-3">

            {/* Botón de Notificaciones */}
            <Link
              to="/NotificationsAdmin"
              className="d-inline-flex align-items-center justify-content-center notification-trigger"
              style={{ textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="white">
                <path d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z" />
              </svg>
            </Link>

            {/* Menú de Usuario */}
            <div className="position-relative">
              <div
                className="d-inline-flex align-items-center user-menu-trigger"
                onClick={toggleUserMenu}
                style={{ cursor: 'pointer' }}
              >
                <span className="fw-bold me-2 title-headersb">
                  {userData?.fullName?.split(' ')[0] || 'Invitado'}
                </span>

                {userImageUrl ? (
                  <img
                    src={userImageUrl}
                    alt="Avatar del usuario"
                    className="ms-2 rounded-circle img-50"
                    onError={(e) => {
                      // Ocultar la imagen rota para que aparezca el SVG fallback
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="#ffffffff">
                    <path d="M222-255q63-40 124.5-60.5T480-336q72 0 134 20.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm-.21 370q-83.15 0-156.28-31.5t-127.22-86Q142-252 111-324.84 80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.5t-127.13 86Q562.74-80 479.6-80Z" />
                  </svg>
                )}

                <span className="ms-2 text-white">{isUserMenuOpen ? '▲' : '▼'}</span>
              </div>

              {/* Dropdown de Usuario */}
              {isUserMenuOpen && userData && (
                <div className="user-dropdown position-absolute end-0 mt-2">
                  <div className="p-3 border-bottom">
                    <div className="fw-bold">{userData.fullName}</div>
                    <div className="text-muted small">{userData.email}</div>
                    <div className="badge bg-secondary small mt-1">{getUserLabel()}</div>
                  </div>
                  <button
                    className="dropdown-item-custom"
                    onClick={() => {
                      openPerfil();
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Ver perfil
                  </button>
                  <Link to="/logout" className="dropdown-item-custom">
                    Cerrar sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${openComponent === "sidebar" ? "active" : ""}`}
        onClick={() => setOpenComponent(null)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${openComponent === "sidebar" ? "open" : ""}`}>
        <div className="p-4 mt-5 pt-5">
          <nav className="mt-5">
            <a href="/" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentcolor">
                <path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z" />
              </svg>
              Inicio
            </a>
            <Link to="/EventsHomeAdmin" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor">
                <path d="m80-80 190.67-533.33 344.66 342L80-80Zm111.33-111.33 303.34-108-196-196.67-107.34 304.67Zm374-258L528.67-486l234.66-234.67q32-32 79.67-32.33 47.67-.33 79.67 31.67L942-702l-36.67 36.67L884.67-686q-17.34-17.33-41-17.67Q820-704 802-686L565.33-449.33ZM406-606l-36.67-36.67 28-28q20-20 19-46.33t-19-44.33L370-788.67l36.67-36.66 26 26q34 34 33.66 83.66Q466-666 432-632l-26 26Zm80.67 78L450-564.67 599.33-714q17.34-17.33 17-44-.33-26.67-17.66-44l-62-62 36.66-36.67 63.34 63.34q31.33 32 32 79.33.66 47.33-31.34 79.33L486.67-528Zm158.66 159.33-36.66-36.66L661.33-458q34-34 81.67-34.67 47.67-.66 81.67 33.34L880-404l-36.67 36.67-56-56q-20-20-43.66-20-23.67 0-43.67 20l-54.67 54.66Zm-454 177.34Z" />
              </svg>
              Gestionar Eventos
            </Link>
            <Link to="/ManageAccounts" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor">
                <path d="M38.67-160v-100q0-34.67 17.83-63.17T105.33-366q69.34-31.67 129.67-46.17 60.33-14.5 123.67-14.5 63.33 0 123.33 14.5T611.33-366q31 14.33 49.17 42.83T678.67-260v100h-640Zm706.66 0v-102.67q0-56.66-29.5-97.16t-79.16-66.84q63 7.34 118.66 22.5 55.67 15.17 94 35.5 34 19.34 53 46.17 19 26.83 19 59.83V-160h-176ZM358.67-480.67q-66 0-109.67-43.66Q205.33-568 205.33-634T249-743.67q43.67-43.66 109.67-43.66t109.66 43.66Q512-700 512-634t-43.67 109.67q-43.66 43.66-109.66 43.66ZM732-634q0 66-43.67 109.67-43.66 43.66-109.66 43.66-11 0-25.67-1.83-14.67-1.83-25.67-5.5 25-27.33 38.17-64.67Q578.67-590 578.67-634t-13.17-80q-13.17-36-38.17-66 12-3.67 25.67-5.5 13.67-1.83 25.67-1.83 66 0 109.66 43.66Q732-700 732-634ZM105.33-226.67H612V-260q0-14.33-8.17-27.33-8.16-13-20.5-18.67-66-30.33-117-42.17-51-11.83-107.66-11.83-56.67 0-108 11.83-51.34 11.84-117.34 42.17-12.33 5.67-20.16 18.67-7.84 13-7.84 27.33v33.33Zm253.34-320.66q37 0 61.83-24.84Q445.33-597 445.33-634t-24.83-61.83q-24.83-24.84-61.83-24.84t-61.84 24.84Q272-671 272-634t24.83 61.83q24.84 24.84 61.84 24.84Zm0 320.66Zm0-407.33Z" />
              </svg>
              Gestionar Cuentas
            </Link>
            <Link to="/HomeResources" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="M620-160.33 456.67-323.67 504-371l116 116 234.67-234.67L902-442.33l-282 282Zm220-408.34h-66.67v-204.66h-66.66v100H253.33v-100h-66.66v586.66H434V-120H186.67q-28.34 0-47.5-19.17Q120-158.33 120-186.67v-586.66q0-28.34 19.17-47.5Q158.33-840 186.67-840H377q8.33-35 37.33-57.5T480-920q37.33 0 66.17 22.5Q575-875 583.33-840h190q28.34 0 47.5 19.17Q840-801.67 840-773.33v204.66ZM480-773.33q17 0 28.5-11.5t11.5-28.5q0-17-11.5-28.5t-28.5-11.5q-17 0-28.5 11.5t-11.5 28.5q0 17 11.5 28.5t28.5 11.5Z" /></svg>
              Gestionar Recursos</Link>
            <Link to="/GalleryAdmin" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="M350-384.67h394l-130.67-174-99.33 130-66-84.66-98 128.66Zm-70 171.34q-27 0-46.83-19.84Q213.33-253 213.33-280v-533.33q0-27 19.84-46.84Q253-880 280-880h533.33q27 0 46.84 19.83Q880-840.33 880-813.33V-280q0 27-19.83 46.83-19.84 19.84-46.84 19.84H280Zm0-66.67h533.33v-533.33H280V-280ZM146.67-80q-27 0-46.84-19.83Q80-119.67 80-146.67v-600h66.67v600h600V-80h-600ZM280-813.33V-280v-533.33Z" /></svg>
              Gestionar Galería</Link>
            <Link to="/SurvayHome" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor">
                <path d="M186.67-120q-27.5 0-47.09-19.58Q120-159.17 120-186.67v-586.66q0-27.5 19.58-47.09Q159.17-840 186.67-840h192.66q7.67-35.33 35.84-57.67Q443.33-920 480-920t64.83 22.33Q573-875.33 580.67-840h192.66q27.5 0 47.09 19.58Q840-800.83 840-773.33v586.66q0 27.5-19.58 47.09Q800.83-120 773.33-120H186.67Zm0-66.67h586.66v-586.66H186.67v586.66ZM280-280h275.33v-66.67H280V-280Zm0-166.67h400v-66.66H280v66.66Zm0-166.66h400V-680H280v66.67Zm200-181.34q13.67 0 23.5-9.83t9.83-23.5q0-13.67-9.83-23.5t-23.5-9.83q-13.67 0-23.5 9.83t-9.83 23.5q0 13.67 9.83 23.5t23.5 9.83Zm-293.33 608v-586.66 586.66Z" />
              </svg>
              Encuestas
            </Link>
            <Link to="/ListContracts" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor">
                <path d="M230-80q-45.83 0-77.92-32.08Q120-144.17 120-190v-130h120v-560h600v690q0 45.83-32.08 77.92Q775.83-80 730-80H230Zm499.94-66.67q18.39 0 30.89-12.45 12.5-12.46 12.5-30.88v-623.33H306.67V-320h380v130q0 18.42 12.44 30.88 12.44 12.45 30.83 12.45ZM360-626.67v-66.66h360v66.66H360Zm0 120v-66.66h360v66.66H360Zm-130.67 360H620v-106.66H186.67V-190q0 18.42 12.5 30.88 12.5 12.45 30.16 12.45Zm0 0h-42.66H620 229.33Z" />
              </svg>
              Contratos
            </Link>
            <Link to="/CalendarAdmin" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="M186.67-80q-27 0-46.84-19.83Q120-119.67 120-146.67v-600q0-27 19.83-46.83 19.84-19.83 46.84-19.83h56.66V-880h70v66.67h333.34V-880h70v66.67h56.66q27 0 46.84 19.83Q840-773.67 840-746.67v600q0 27-19.83 46.84Q800.33-80 773.33-80H186.67Zm0-66.67h586.66v-420H186.67v420Zm0-486.66h586.66v-113.34H186.67v113.34Zm0 0v-113.34 113.34Z" /></svg>
              Calendario
            </Link>
          </nav>
        </div>
      </div>

      {/* Modal de perfil */}
      <PerfilModal
        isOpen={openComponent === "perfil"}
        onClose={() => setOpenComponent(null)}
        user={userData}
        onEdit={() => setOpenComponent("edit")}
      />

      {/* Modal de edición */}
      <EditModal
        isOpen={openComponent === "edit"}
        onClose={() => setOpenComponent(null)}
        user={userData}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default HeaderCl;