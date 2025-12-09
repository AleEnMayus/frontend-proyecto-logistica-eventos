import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import '../CSS/components.css';
import '../CSS/Home.css';
import '../../Views/CSS/HeaderSB.css';
import HeaderAdm from '../../components/HeaderSidebar/HeaderAdm';
import PromotionModal from '../../components/Modals/PromotionModal/EditPromotion';
import ModalPromotionCreate from '../../components/Modals/PromotionModal/CreatePromotion';

const HomeAdmin = ({ user, onLogout }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [creating, setCreating] = useState(false);
  const [adminUser, setAdminUser] = useState(user || null);
  const [promociones, setPromociones] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // Estadísticas del dashboard
  const [stats, setStats] = useState({
    events: 124,
    users: 89,
    pendingRequests: 12,
    weekEvents: 7,
    resources: 45,
    photos: 1250
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setAdminUser(JSON.parse(storedUser));

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setAdminUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cargar galería de imágenes
  const loadGallery = async () => {
    try {
      setLoadingGallery(true);
      const response = await api.get("/gallery/1");
      const data = response.data;

      if (data && data.navigation) {
        const totalImages = data.navigation.totalImages;
        const imagesToLoad = Math.min(totalImages, 5);

        const imagePromises = [];
        for (let i = 1; i <= imagesToLoad; i++) {
          imagePromises.push(
            api.get(`/gallery/${i}`)
              .then(res => res.data)
              .catch(err => null)
          );
        }

        const images = await Promise.all(imagePromises);
        const validImages = images.filter(img => img && img.url);
        setGalleryImages(Array.isArray(validImages) ? validImages : []);
      }
    } catch (err) {
      console.error("Error cargando galería:", err);
      setGalleryImages([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Cargar promociones
  const loadPromotions = () => {
    api.get("/promotions")
      .then(res => setPromociones(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Error cargando promociones:", err);
        setPromociones([]);
      });
  };

  useEffect(() => {
    loadPromotions();
    loadGallery();
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % galleryImages.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <HeaderAdm user={adminUser} onLogout={onLogout} />

      <main className="container my-5 mt-5 pt-5">

        {/* INICIO */}
        <section id="inicio" className="mb-5 mt-5">
          <h1 className="display-4 fw-bold text-dark mb-2">
            Panel de Administrador - ¡Bienvenido {adminUser?.fullName || 'Administrador'}!
          </h1>
          <p className="lead text-muted mb-4">
            Desde aquí puedes gestionar usuarios, eventos y ver estadísticas completas del sistema.
          </p>
        </section>

        {/* TARJETAS DE ACCESO RÁPIDO */}
        <section className="mb-5">
          <div className="row g-4">
            {/* Tarjeta 1: Gestión de Eventos */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#fecdd3' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#dc2626">
                      <path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
                    </svg>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Gestión de Eventos</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Como administrador, puedes ver y gestionar todos los eventos registrados en el sistema.
                  </p>
                  <a href="/EventsHomeAdmin" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Gestionar eventos
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Gestión de Cuentas */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#dbeafe' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#2563eb">
                      <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z" />
                    </svg>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Gestión de Cuentas</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Administra usuarios, permisos y roles del sistema desde un solo lugar.
                  </p>
                  <a href="/ManageAccounts" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Ver usuarios
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Solicitudes Pendientes */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#fef3c7' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#d97706">
                      <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
                    </svg>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Solicitudes Pendientes</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Revisa y gestiona las solicitudes pendientes de aprobación en el sistema.
                  </p>
                  <a href="/NotificationsAdmin" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Ver solicitudes
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Calendario */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#d1fae5' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#059669">
                      <path d="M200-640h560v-80H200v80Zm0 0v-80 80Zm0 560q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v227q-19-9-39-15t-41-9v-43H200v400h252q7 22 16.5 42T491-80H200Zm520 40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm67-105 28-28-75-75v-112h-40v128l87 87Z" />
                    </svg>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Calendario Global</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Visualiza todos los eventos y citas programadas del sistema en un calendario completo.
                  </p>
                  <a href="/CalendarAdmin" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Ir al calendario
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 5: Gestión de Galería */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#e9d5ff' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#9333ea">
                      <path d="M120-200q-33 0-56.5-23.5T40-280v-400q0-33 23.5-56.5T120-760h400q33 0 56.5 23.5T600-680v400q0 33-23.5 56.5T520-200H120Zm600-320q-17 0-28.5-11.5T680-560v-160q0-17 11.5-28.5T720-760h160q17 0 28.5 11.5T920-720v160q0 17-11.5 28.5T880-520H720Zm40-80h80v-80h-80v80ZM120-280h400v-400H120v400Zm40-80h320L375-500l-75 100-55-73-85 113Zm560 160q-17 0-28.5-11.5T680-240v-160q0-17 11.5-28.5T720-440h160q17 0 28.5 11.5T920-400v160q0 17-11.5 28.5T880-200H720Zm40-80h80v-80h-80v80Zm-640 0v-400 400Zm640-320v-80 80Zm0 320v-80 80Z" />
                    </svg>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Gestión de Galería</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Administra, edita y organiza todas las fotos y videos de eventos del sistema.
                  </p>
                  <a href="/GalleryAdmin" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Administrar galería
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 6: Gestión de Recursos */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#f7bbf0ff' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ff53ebff">
                      <path d="M240-160q-50 0-85-35t-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T280-280q0-17-11.5-28.5T240-320q-17 0-28.5 11.5T200-280q0 17 11.5 28.5T240-240ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm600 80q17 0 28.5-11.5T760-320q0-17-11.5-28.5T720-360q-17 0-28.5 11.5T680-320q0 17 11.5 28.5T720-280Zm-40-200h170l-90-120h-80v120ZM360-540Z" />
                    </svg>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Gestión de Recursos</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Controla el inventario, equipos y recursos disponibles para eventos.
                  </p>
                  <a href="/HomeResources" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Ver recursos
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta: Manuales (Admin) */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#eef2ff' }}>
                    <i className="bi bi-book-fill fs-4" style={{ color: '#4f46e5' }}></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Manuales</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Descarga los manuales para administrador y usuario.
                  </p>
                  <div className="d-flex flex-column gap-2">
                    <a href="/manual_usuario.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm text-start">
                      <i className="bi bi-file-pdf me-2"></i>
                      Manual - Usuario
                    </a>
                    <a href="/manual_usuario.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm text-start">
                      <i className="bi bi-file-pdf me-2"></i>
                      Manual - Técnico (próximamente)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <section id="galeria" className="gallery-section">
          <h2 className="section-title">Galería De Eventos</h2>
          
          {loadingGallery ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando galería...</p>
            </div>
          ) : galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0 ? (
            <div className="gallery-carousel">
              <div className="carousel-wrapper">
                <div 
                  className="carousel-track" 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.isArray(galleryImages) && galleryImages.map((image) => (
                    <div key={image.FileId} className="carousel-slide">
                      <div className="image-container">
                        <img
                          src={image.url}
                          alt={image.FileName}
                          className="gallery-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {galleryImages.length > 1 && (
                <>
                  <button className="carousel-btn prev" onClick={prevSlide}>
                    <span className="carousel-btn">‹</span>
                  </button>
                  <button className="carousel-btn next" onClick={nextSlide}>
                    <span className="carousel-btn">›</span>
                  </button>
                  
                  <div className="carousel-indicators">
                    {Array.isArray(galleryImages) && galleryImages.map((_, index) => (
                      <div
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay imágenes en la galería</p>
            </div>
          )}
        </section>

        {/* Eventos */}
        <section id="citas" className="appointment-section">
          <div className="appointment-card">
            <h2 className="section-title">Gestión de Eventos</h2>
            <p className="appointment-description">
              Accede a la sección de gestión de eventos para crear, editar o eliminar eventos programados.
            </p>
          <a href="/EventsHomeAdmin" className="btn-primary-custom btn w-200p">
            Gestionar Eventos
          </a>
          </div>
        </section>

        {/* PROMOCIONES */}
        <section id="promociones" className="promotions-section">
          <div className="promotions-header">
            <h2 className="section-title">Administrar Promociones</h2>
            <p className="text-muted mb-3">
              Aquí puedes visualizar, modificar o eliminar promociones y paquetes del sistema.
            </p>

            {promociones.length < 4 && (
              <div className="text-start mb-3">
                <button
                  className="btn-primary-custom btn"
                  onClick={() => setCreating(true)}
                >
                  + Crear Promoción
                </button>
              </div>
            )}
          </div>

          <div className="promotions-grid">
            {Array.isArray(promociones) && promociones.map((promo) => (
              <div
                key={promo.PromotionId}
                className="promotion-card"
                onClick={() => setSelectedPromo(promo)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className="promotion-title">{promo.TitleProm}</h3>
                <div className="promotion-body">
                  <p className="promotion-description">
                    <strong>Descripción:</strong> {promo.DescriptionProm}
                  </p>
                </div>
                <div className="promotion-footer">
                  <p className="promotion-price">
                    <strong>Valor: ${promo.Price}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedPromo && (
            <PromotionModal
              promo={selectedPromo}
              onClose={() => setSelectedPromo(null)}
              refreshPromos={loadPromotions}
            />
          )}

          {creating && (
            <ModalPromotionCreate
              onClose={() => setCreating(false)}
              refreshPromos={loadPromotions}
            />
          )}
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="contact-section">
          <div className="contact-grid">
            <div className="contact-column">
              <h3 className="contact-title">Contacto</h3>
              <div className="contact-item">
                <span className="contact-label">Teléfono:</span>
                <span className="contact-value">+57 3133409132</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Dirección:</span>
                <span className="contact-value">Calle 77 Sur N° 81H-20/Bogotá D.C-Colombia</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Correo Electrónico:</span>
                <span className="contact-value">happy.art.eventos@gmail.com</span>
              </div>
            </div>

            <div className="contact-column">
              <h3 className="contact-title px120">Redes Sociales</h3>
              <div className="contact-item">
                <span className="contact-label">TikTok:</span>
                <span className="contact-value">@happy.art.eventos</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Instagram:</span>
                <span className="contact-value">@happy_art_eventos</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Facebook:</span>
                <span className="contact-value">Happy-Art-EVENTOS</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default HomeAdmin;