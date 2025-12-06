import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import HeaderAdm from "../../../components/HeaderSidebar/HeaderAdm";
import "../../CSS/Gallery.css";
import "../../CSS/components.css";
import { useNavigate } from "react-router-dom";
import UploadPhotoModal from "./galleryof";
import ConfirmModal from "../../../components/Modals/ModalConfirm";
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";

// Funciones Fetch API Nueva


async function getImages(page = 1, limit = 8) {
  const response = await api.get(`/gallery/paginated?page=${page}&limit=${limit}`);
  return response.data;
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/gallery`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

async function deleteImage(id) {
  const response = await api.delete(`/gallery/${id}`);
  return response.data;
}

async function deleteAllImages(id) {
  const response = await api.delete(`/gallery`);
  return response.data;
}


// Componente principal


const ImageGalleryC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [images, setImages] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  // Cargar imágenes paginadas
  useEffect(() => {
    loadImages(pageInfo.page);
  }, []);

  const loadImages = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getImages(page, 8);
      setImages(data.images || []);
      setPageInfo({
        page: data.page,
        totalPages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      });
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
      addToast("Error al cargar las imágenes", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Subir imagen
  const handleConfirmUpload = async (file) => {
    try {
      const data = await uploadImage(file);
      console.log("Imagen subida:", data);
      addToast("Imagen subida correctamente", "success");
      loadImages(pageInfo.page);
    } catch (err) {
      console.error("Error al subir imagen:", err);
      addToast("Error al subir la imagen", "danger");
    }
  };

  // Confirmar eliminación
  const requestDeleteImage = (id, e) => {
    e.stopPropagation();
    setConfirmMessage("¿Estás seguro de que deseas eliminar esta imagen?");
    setConfirmAction(() => () => handleDeleteImage(id));
    setShowConfirmModal(true);
  };

  // Eliminar imagen
  const handleDeleteImage = async (id) => {
    try {
      const data = await deleteImage(id);
      addToast("Imagen eliminada correctamente", "success");

      if (data.isEmpty) {
        setImages([]);
      } else {
        await loadImages(pageInfo.page);
      }
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      addToast("Error al eliminar la imagen", "danger");
    }
  };

  const requestDeleteAllImages = (e) => {
    if (e) e.stopPropagation();
    
    // Verificar si hay imágenes
    if (images.length === 0) {
      addToast("No hay imágenes para eliminar", "danger");
      return;
    }
    
    setConfirmMessage(`¿Estás seguro de que deseas eliminar TODAS las ${images.length} imágenes? Esta acción no se puede deshacer.`);
    setConfirmAction(() => handleDeleteAllImages);
    setShowConfirmModal(true);
  };

  const handleDeleteAllImages = async () => {
    try {
      const data = await deleteAllImages();
      
      // Limpiar el estado
      setImages([]);
      setPageInfo({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      
      addToast(data.message || "Todas las imágenes han sido eliminadas", "success");
      
    } catch (err) {
      console.error("Error al eliminar todas las imágenes:", err);
      addToast("Error al eliminar las imágenes", "danger");
    }
  };

  // Navegación hacia vista individual
  const handleImageClick = (id) => {
    navigate(`/GalleryViewAdmin/${id}`);
  };

  return (
    <div className="gallery-manager">
      <HeaderAdm />

      <div className="gallery-left">
        <div className="gallery-header">
          <h2 className="gallery-title">Galería de Eventos</h2>

          <div className="gallery-actions d-flex flex-wrap">
            <button
              className="btn-primary-custom btn me-2 mb-2"
              onClick={() => setShowUploadModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
              </svg>
              Subir Imagen
            </button>
            <button
              className="btn-secondary-custom btn mb-2"
              onClick={() => requestDeleteAllImages()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
              </svg>
              Eliminar TODA la galeria
            </button>
          </div>
        </div>

        <div className="gallery-grid">
          {loading ? (
            <p>Cargando imágenes...</p>
          ) : images.length === 0 ? (
            <p>No hay imágenes disponibles.</p>
          ) : (
            images.map((img) => (
              <div key={img.FileId} className="image-card">
                <div
                  onClick={() => handleImageClick(img.FileId)}
                  className="image-wrapper"
                >
                  <img
                    src={img.url}
                    alt={img.FileName}
                    className="preview-image"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>

                <button
                  className="delete-image-btn"
                  onClick={(e) => requestDeleteImage(img.FileId, e)}
                  title="Eliminar imagen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="currentcolor"
                  >
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {pageInfo.totalPages > 1 && (
          <div className="pagination mb-2">
            <button
              className="pagination-arrow"
              onClick={() => loadImages(pageInfo.page - 1)}
              disabled={!pageInfo.hasPrevPage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
              </svg>
            </button>

            <span className="pagination-info">
              Página {pageInfo.page} de {pageInfo.totalPages}
            </span>

            <button
              className="pagination-arrow"
              onClick={() => loadImages(pageInfo.page + 1)}
              disabled={!pageInfo.hasNextPage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <UploadPhotoModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={handleConfirmUpload}
        title="Subir Nueva Imagen"
      />

      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          confirmAction?.();
          setShowConfirmModal(false);
        }}
        message={confirmMessage}
        confirmText="Eliminar"
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ImageGalleryC;