import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PerfilModal from "../Modals/AccountModal/account";
import EditModal from "../Modals/AccountModal/EditAccount";
import api from '../../utils/axiosConfig';

const HeaderCl = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openComponent, setOpenComponent] = useState(null); // "sidebar" | "perfil" | "edit" | null
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    photo: null,
  });

  // Cargar usuario desde sessionStorage y escuchar cambios
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        setUserData(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  //  Guarda cambios de perfil en estado y sessionStorage
  const handleSaveProfile = (updatedData) => {
    const updatedUser = { ...userData, ...updatedData };
    setUserData(updatedUser);
    try { sessionStorage.setItem("user", JSON.stringify(updatedUser)); } catch(e) { console.warn('sessionStorage set failed', e); }
    console.log("Perfil actualizado:", updatedData);
  };

  const toggleMenu = () =>
    setOpenComponent(openComponent === "sidebar" ? null : "sidebar");
  
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

  const userImageUrl = photoUrl || null;

  const getUserLabel = () => {
    if (userData?.role === "admin") return "Admin";
    if (userData) return "Cliente";
    return "?";
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container">
          <div className="row align-items-center py-3">
            {/* Logo y menú lateral */}
            <div className="col-6">
              <div className="d-flex align-items-center">
                <button className="menu-btn me-3" onClick={toggleMenu}>
                  ☰
                </button>
                <a href="/" className="d-flex logolink">
                  <img src="/Logo-White.png" className="img-50" alt="Logo" />
                  <div className="logo-text">Happy-Art-Events</div>
                </a>
              </div>
            </div>

            {/* Notificaciones y Usuario */}
            <div className="col-6 d-flex justify-content-end align-items-center gap-3">
              {/* Notificaciones */}
              <Link
                to="/Notification-tray"
                className="d-inline-flex align-items-center justify-content-center notification-trigger me-3"
                style={{ textDecoration: "none" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="32px"
                  viewBox="0 -960 960 960"
                  width="32px"
                  fill="white"
                >
                  <path d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z" />
                </svg>
              </Link>

              {/* Menú Usuario */}
              <div className="position-relative">
                <div
                  className="d-inline-flex align-items-center user-menu-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="fw-bold me-2 title-headersb">
                    {userData?.fullName?.split(" ")[0] || "Invitado"}
                  </span>

                  {userImageUrl ? (
                    <img
                      src={userImageUrl}
                      alt="Avatar del usuario"
                      className="ms-2 rounded-circle img-50"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="50px"
                      viewBox="0 -960 960 960"
                      width="50px"
                      fill="#ffffffff"
                    >
                      <path d="M222-255q63-40 124.5-60.5T480-336q72 0 134 20.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm-.21 370q-83.15 0-156.28-31.5t-127.22-86Q142-252 111-324.84 80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.5t-127.13 86Q562.74-80 479.6-80Z" />
                    </svg>
                  )}

                  <span className="ms-2 text-white">{isUserMenuOpen ? "▲" : "▼"}</span>
                </div>

                {/* Dropdown */}
                {isUserMenuOpen && userData && (
                  <div className="user-dropdown position-absolute end-0 mt-2">
                    <div className="p-3 border-bottom">
                      <div className="fw-bold">{userData.fullName}</div>
                      <div className="text-muted small">{userData.email}</div>
                      <div className="badge bg-secondary small mt-1">
                        {getUserLabel()}
                      </div>
                    </div>
                    <button
                      className="dropdown-item-custom"
                      onClick={() => {
                        setOpenComponent("perfil");
                        setIsUserMenuOpen(false);
                      }}
                    >
                      Ver perfil
                    </button>
                    <Link to="/Logout" className="dropdown-item-custom">
                      Cerrar sesión
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${openComponent === "sidebar" ? "active" : ""
          }`}
        onClick={() => setOpenComponent(null)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${openComponent === "sidebar" ? "open" : ""}`}>
        <div className="p-4 mt-5 pt-5">
          <nav className="mt-5">
            <a href="/" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentcolor"><path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z" /></svg>
              Inicio</a>
            <Link to="/Schedule" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="currentcolor"><path d="M693.33-80v-120h-120v-66.67h120v-120H760v120h120V-200H760v120h-66.67Zm-506.66-80q-27 0-46.84-19.83Q120-199.67 120-226.67v-520q0-27 19.83-46.83 19.84-19.83 46.84-19.83h56.66V-880h70v66.67h253.34V-880h70v66.67h56.66q27 0 46.84 19.83Q760-773.67 760-746.67V-464q-16.67-2.33-33.33-2.33-16.67 0-33.34 2.33v-102.67H186.67v340h306.66q0 16.67 3 33.34 3 16.66 9 33.33H186.67Zm0-473.33h506.66v-113.34H186.67v113.34Zm0 0v-113.34 113.34Z" /></svg>
              Agendar cita</Link>
            <Link to="/HomeContracts" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="M230-80q-45.83 0-77.92-32.08Q120-144.17 120-190v-130h120v-560h600v690q0 45.83-32.08 77.92Q775.83-80 730-80H230Zm499.94-66.67q18.39 0 30.89-12.45 12.5-12.46 12.5-30.88v-623.33H306.67V-320h380v130q0 18.42 12.44 30.88 12.44 12.45 30.83 12.45ZM360-626.67v-66.66h360v66.66H360Zm0 120v-66.66h360v66.66H360Zm-130.67 360H620v-106.66H186.67V-190q0 18.42 12.5 30.88 12.5 12.45 30.16 12.45Zm0 0h-42.66H620 229.33Z" /></svg>
              Contrato</Link>
            <Link to="/Calendar" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="M186.67-80q-27 0-46.84-19.83Q120-119.67 120-146.67v-600q0-27 19.83-46.83 19.84-19.83 46.84-19.83h56.66V-880h70v66.67h333.34V-880h70v66.67h56.66q27 0 46.84 19.83Q840-773.67 840-746.67v600q0 27-19.83 46.84Q800.33-80 773.33-80H186.67Zm0-66.67h586.66v-420H186.67v420Zm0-486.66h586.66v-113.34H186.67v113.34Zm0 0v-113.34 113.34Z" /></svg>
              Calendario</Link>
            <Link to="/EventsHome" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="m80-80 190.67-533.33 344.66 342L80-80Zm111.33-111.33 303.34-108-196-196.67-107.34 304.67Zm374-258L528.67-486l234.66-234.67q32-32 79.67-32.33 47.67-.33 79.67 31.67L942-702l-36.67 36.67L884.67-686q-17.34-17.33-41-17.67Q820-704 802-686L565.33-449.33ZM406-606l-36.67-36.67 28-28q20-20 19-46.33t-19-44.33L370-788.67l36.67-36.66 26 26q34 34 33.66 83.66Q466-666 432-632l-26 26Zm80.67 78L450-564.67 599.33-714q17.34-17.33 17-44-.33-26.67-17.66-44l-62-62 36.66-36.67 63.34 63.34q31.33 32 32 79.33.66 47.33-31.34 79.33L486.67-528Zm158.66 159.33-36.66-36.66L661.33-458q34-34 81.67-34.67 47.67-.66 81.67 33.34L880-404l-36.67 36.67-56-56q-20-20-43.66-20-23.67 0-43.67 20l-54.67 54.66Zm-454 177.34Z" /></svg>
              Eventos</Link>
            <Link to="/gallery" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="Currentcolor"><path d="M106.67-200q-27.5 0-47.09-19.58Q40-239.17 40-266.67v-426.66q0-27.5 19.58-47.09Q79.17-760 106.67-760h426.66q27.5 0 47.09 19.58Q600-720.83 600-693.33v426.66q0 27.5-19.58 47.09Q560.83-200 533.33-200H106.67ZM720-520q-17 0-28.5-11.5T680-560v-160q0-17 11.5-28.5T720-760h160q17 0 28.5 11.5T920-720v160q0 17-11.5 28.5T880-520H720Zm26.67-66.67h106.66v-106.66H746.67v106.66Zm-640 320h426.66v-426.66H106.67v426.66ZM160-360h320L375-500l-75 100-55-73-85 113Zm560 160q-17 0-28.5-11.5T680-240v-160q0-17 11.5-28.5T720-440h160q17 0 28.5 11.5T920-400v160q0 17-11.5 28.5T880-200H720Zm26.67-66.67h106.66v-106.66H746.67v106.66Zm-640 0v-426.66 426.66Zm640-320v-106.66 106.66Zm0 320v-106.66 106.66Z" /></svg>
              Galería</Link>
          </nav>
        </div>
      </div>

      {/* Modales */}
      <PerfilModal
        isOpen={openComponent === "perfil"}
        onClose={() => setOpenComponent(null)}
        user={userData}
        onEdit={() => setOpenComponent("edit")}
      />

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
