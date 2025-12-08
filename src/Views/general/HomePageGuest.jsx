import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import '../CSS/Home.css';
import HeaderSidebar from '../../components/HeaderSidebar/HeaderSidebar';
import ModalPromotionView from '../../components/Modals/PromotionModal/ModalPromotionView';

const HomeGuest = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [promociones, setPromociones] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

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
  }, []);

  // Cargar galería
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="home-guest">
      <HeaderSidebar />

      <main className="main-content mx-auto px-2">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Happy-Art-Events</span>
            </h1>
            <p className="hero-description">
              Nuestra empresa transforma la forma de organizar eventos a través de una plataforma moderna y segura que permite explorar nuestra galería, conocer paquetes de servicios, registrarse fácilmente, gestionar eventos, descargar contratos, agendar citas y recibir notificaciones automáticas.
            </p>
          </div>
        </section>

        {/* Galería */}
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

        {/* Citas */}
        <section id="eventos" className="appointment-section">
          <div className="appointment-card">
            <h2 className="section-title">Agendamiento De Citas</h2>
            <p className="appointment-description">
              Especificación de espacio donde se podrá asignar una cita para el evento que desee el usuario.
            </p>
            <a href="/login" className="btn btn-primary">
              Agendar Cita
            </a>
          </div>
        </section>

        {/* Promociones */}
        <section id="promociones" className="promotions-section">
          <div className="promotions-header">
            <h2 className="section-title">Paquetes De Promociones</h2>
          </div>

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

        {/* Contacto */}
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

export default HomeGuest;