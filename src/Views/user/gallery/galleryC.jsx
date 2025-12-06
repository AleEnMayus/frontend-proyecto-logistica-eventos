import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import HeaderCl from "../../../components/HeaderSidebar/HeaderCl";
import { useNavigate } from "react-router-dom";
import "../../CSS/Gallery.css";
import "../../CSS/components.css";

// ================================
// Función fetch: obtener imágenes paginadas
// ================================
async function getPaginatedImages(page = 1, limit = 8) {
  const response = await api.get(`/gallery/paginated?page=${page}&limit=${limit}`);
  return response.data;
}

// ================================
// Componente principal
// ================================
const ImageGalleryC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Cargar imágenes al montar o cambiar de página
  useEffect(() => {
    loadImages();
  }, [page]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await getPaginatedImages(page, 8);
      setImages(data.images || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error al cargar galería:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ir a la vista ampliada
  const handleImageClick = (img) => {
    navigate(`/GalleryView/${img.FileId}`);
  };

  // Paginación
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="gallery-manager">
      <HeaderCl />

      <div className="gallery-left">
        <div className="gallery-header">
          <h2 className="h1 bold">GALERÍA DE EVENTOS</h2>
        </div>

        {loading ? (
          <div className="loading">Cargando imágenes...</div>
        ) : images.length === 0 ? (
          <div className="no-images">No hay imágenes disponibles</div>
        ) : (
          <div className="gallery-grid">
            {images.map((img) => (
              <div
                key={img.FileId}
                className="image-card"
                onClick={() => handleImageClick(img)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={img.url}
                  alt={img.FileName || "imagen"}
                  className="preview-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Controles de paginación */}
          <div className="pagination mb-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="pagination-arrow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          <span className="page-indicator">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="pagination-arrow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryC;
