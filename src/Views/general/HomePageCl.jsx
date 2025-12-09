import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import '../CSS/components.css';
import '../CSS/Home.css';
import '../../Views/CSS/HeaderSB.css';
import HeaderCl from '../../components/HeaderSidebar/HeaderCl';

// modal SOLO LECTURA
import ModalPromotionView from '../../components/Modals/PromotionModal/ModalPromotionView';

const HomeClient = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promociones, setPromociones] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // === Cargar usuario desde localStorage ===
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Cargar promociones reales desde el backend
  useEffect(() => {
    api.get("/promotions")
      .then(res => setPromociones(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Error cargando promociones:", err);
        setPromociones([]);
      });
  }, []);

  // Cargar galería de imágenes
  useEffect(() => {
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

    loadGallery();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* ====== HEADER CLIENTE ====== */}
      <HeaderCl user={user} onLogout={handleLogout} />

      <main className="container my-5 mt-5 pt-5">
        {/* ====== SECCIÓN BIENVENIDA ====== */}
        <section id="inicio" className="mb-5 mt-5">
          <h1 className="display-4 fw-bold text-dark mb-2">
            Panel de Cliente - ¡Bienvenido {user?.fullName || 'Invitado'}!
          </h1>
          <p className="lead text-muted mb-5">
            Ahora puedes agendar citas, ver tus eventos y acceder a promociones exclusivas.
          </p>
        </section>

        {/* ====== TARJETAS DE ACCESO RÁPIDO ====== */}
        <section className="mb-5">
          <div className="row g-4">
            {/* Tarjeta 1: Agendar Cita */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#d1fae5' }}>
                    <i className="bi bi-calendar-check-fill fs-4" style={{ color: '#059669' }}><svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#08ca8cff"><path d="M680-80v-120H560v-80h120v-120h80v120h120v80H760v120h-80Zm-480-80q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h40v-80h80v80h240v-80h80v80h40q33 0 56.5 23.5T760-720v244q-20-3-40-3t-40 3v-84H200v320h280q0 20 3 40t11 40H200Zm0-480h480v-80H200v80Zm0 0v-80 80Z" /></svg></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Agendar Próxima Cita</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Reserva tu próxima consulta o reunión con nosotros fácilmente.
                  </p>
                  <a href="/Schedule" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{color: ' rgb(21, 165, 231) - #15A5E7 '}}>
                    Agendar ahora
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Revisar Contrato */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#dbeafe' }}>
                    <i className="bi bi-file-earmark-text-fill fs-4" style={{ color: '#2563eb' }}><svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#2a6dffff"><path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z" /></svg></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Revisar Contrato</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Revisa los contratos recibidos.
                  </p>
                  <a href="/HomeContracts" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: ' #15A5E7 '}}> 
                    Ver documento
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Tu Calendario */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#fef3c7' }}>
                    <i className="bi bi-calendar3 fs-4" style={{ color: '#d97706' }}><svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ff8c08ff"><path d="M200-640h560v-80H200v80Zm0 0v-80 80Zm0 560q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v227q-19-9-39-15t-41-9v-43H200v400h252q7 22 16.5 42T491-80H200Zm520 40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm67-105 28-28-75-75v-112h-40v128l87 87Z" /></svg></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Tu Calendario</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Visualiza todas tus citas y eventos programados en un solo lugar.
                  </p>
                  <a href="/Calendar" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: ' #15A5E7 ' }}>
                    Ir al calendario
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Próximo Evento */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#fecdd3' }}>
                    <i className="bi bi-balloon-heart-fill fs-4" style={{ color: '#dc2626' }}><svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ff3232ff"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" /></svg></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Tus Eventos</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Hazle seguimiento a todos tus próximos eventos.
                  </p>
                  <a href="/EventsHome" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7 ' }}>
                    Ver detalles
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 5: Galería de Eventos */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#e9d5ff' }}>
                    <i className="bi bi-images fs-4" style={{ color: '#9333ea' }}><svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#aa4effff"><path d="M120-200q-33 0-56.5-23.5T40-280v-400q0-33 23.5-56.5T120-760h400q33 0 56.5 23.5T600-680v400q0 33-23.5 56.5T520-200H120Zm600-320q-17 0-28.5-11.5T680-560v-160q0-17 11.5-28.5T720-760h160q17 0 28.5 11.5T920-720v160q0 17-11.5 28.5T880-520H720Zm40-80h80v-80h-80v80ZM120-280h400v-400H120v400Zm40-80h320L375-500l-75 100-55-73-85 113Zm560 160q-17 0-28.5-11.5T680-240v-160q0-17 11.5-28.5T720-440h160q17 0 28.5 11.5T920-400v160q0 17-11.5 28.5T880-200H720Zm40-80h80v-80h-80v80Zm-640 0v-400 400Zm640-320v-80 80Zm0 320v-80 80Z" /></svg></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Galería de Eventos</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Revive los mejores momentos. Disfruta de nuestra galería de eventos.
                  </p>
                  <a href="/Gallery" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color:'#15A5E7' }}>
                    Explorar galería
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Tarjeta 6: Ayuda y Soporte */}
            {/* Tarjeta: Manual de Usuario (Cliente) */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#eef2ff' }}>
                    <i className="bi bi-book-fill fs-4" style={{ color: '#4f46e5' }}></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Manual de Usuario</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Consulta el manual de usuario para aprender a usar la plataforma.
                  </p>
                  <a href="/manual_usuario.pdf" target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    <i className="bi bi-file-pdf me-2"></i>
                    Abrir manual
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body d-flex flex-column">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#e5e7eb' }}>
                    <i className="bi bi-question-circle-fill fs-4" style={{ color: '#4b5563' }}><svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#778190ff"><path d="m480-80-10-120h-10q-142 0-241-99t-99-241q0-142 99-241t241-99q71 0 132.5 26.5t108 73q46.5 46.5 73 108T800-540q0 75-24.5 144t-67 128q-42.5 59-101 107T480-80Zm80-146q71-60 115.5-140.5T720-540q0-109-75.5-184.5T460-800q-109 0-184.5 75.5T200-540q0 109 75.5 184.5T460-280h100v54Zm-101-95q17 0 29-12t12-29q0-17-12-29t-29-12q-17 0-29 12t-12 29q0 17 12 29t29 12Zm-29-127h60q0-30 6-42t38-44q18-18 30-39t12-45q0-51-34.5-76.5T460-720q-44 0-74 24.5T344-636l56 22q5-17 19-33.5t41-16.5q27 0 40.5 15t13.5 33q0 17-10 30.5T480-558q-35 30-42.5 47.5T430-448Zm30-65Z" /></svg></i>
                  </div>
                  <h5 className="card-title fw-semibold text-dark">Ayuda y Soporte</h5>
                  <p className="card-text text-muted flex-grow-1">
                    ¿Tienes preguntas? Estamos aquí para ayudarte en lo que necesites.
                  </p>
                  <a href="#contacto" className="text-decoration-none fw-semibold d-inline-flex align-items-center"
                    style={{ color: '#15A5E7' }}>
                    Contactar
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== GALERÍA ====== */}
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

        {/* ====== PROMOCIONES ====== */}
        <section id="promociones" className="promotions-section">
          <div className="promotions-header">
            <h2 className="section-title">Paquetes De Promociones</h2>
          </div>
          <p className="text-muted mb-4">
            Descubre nuestros paquetes especiales diseñados para todo tipo de eventos.
          </p>
          <div className="promotions-grid">
            {Array.isArray(promociones) && promociones.map((promo) => (
              <div
                key={promo.PromotionId}
                className="promotion-card"
                onClick={() => setSelectedPromo(promo)}
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
            <ModalPromotionView
              promo={selectedPromo}
              onClose={() => setSelectedPromo(null)}
            />
          )}
        </section>

        {/* ====== CONTACTO ====== */}
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

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          border-color: #e5e7eb !important;
        }
      `}</style>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </div >
  );
};

export default HomeClient;