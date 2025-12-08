import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import "../../CSS/GalleryView.css";
import "../../CSS/Modals.css";
import "../../CSS/components.css";
import HeaderAdm from "../../../components/HeaderSidebar/HeaderAdm";
import ConfirmModal from "../../../components/Modals/ModalConfirm";

// toasts
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";

export default function ImageDetail() {
  const { ImgId } = useParams();
  const navigate = useNavigate();

  const { toasts, addToast, removeToast } = useToast();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [navigation, setNavigation] = useState(null);

  // Estados para modal de comentarios
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentModalPage, setCurrentModalPage] = useState(1);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [selectedComments, setSelectedComments] = useState([]);
  const [publicComments, setPublicComments] = useState([]);

  // Función para recargar comentarios
  const refreshComments = async () => {
    try {
      const res = await api.get(`/gallery/${ImgId}/comments`);
      const data = res.data;
      // Ensure data is always an array
      const comments = Array.isArray(data) ? data : [];
      setComments(comments);
      setSelectedComments(comments.map((c) => c.CommentId));
    } catch (err) {
      console.error("Error al recargar comentarios:", err);
      setComments([]);
      setSelectedComments([]);
    }
  };

  // Cargar imagen y comentarios
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const imageRes = await api.get(`/gallery/${ImgId}`);
        const imageData = imageRes.data;
        if (mounted) {
          setImage({
            ImgId: imageData.FileId,
            src: imageData.url,
            alt: imageData.FileName,
          });
          setNavigation(imageData.navigation);
        }

        await refreshComments();
      } catch (err) {
        console.error(err);
        if (mounted) {
          if (err.response?.status === 404) {
            setError("Imagen no encontrada");
          } else {
            setError(err.message || "Error al obtener la imagen");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();

    return () => {
      mounted = false;
    };
  }, [ImgId]);

  // Navegación entre imágenes
  const goToPrevImage = () => {
    if (navigation?.prevId) {
      navigate(`/GalleryViewAdmin/${navigation.prevId}`);
    }
  };

  const goToNextImage = () => {
    if (navigation?.nextId) {
      navigate(`/GalleryViewAdmin/${navigation.nextId}`);
    }
  };

  // Cargar comentarios públicos cuando se abre el modal
  const openCommentModal = async () => {
    try {
      const res = await api.get("/gallery/comments/pending");
      const data = res.data;
      setPublicComments(data);
    } catch (err) {
      console.error("Error al cargar comentarios públicos:", err);
    }
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentModalPage(1);
    refreshComments();
  };

  // Eliminar imagen
  const requestDeleteImage = () => {
    setConfirmMessage("¿Estás seguro de que deseas eliminar esta imagen?");
    setShowConfirmModal(true);
  };

  const handleDeleteImage = async () => {
    try {
      const response = await api.delete(`/gallery/${ImgId}`);
      const data = response.data;

      addToast("Imagen eliminada correctamente", "success");
      // Redirigir según respuesta del backend
      if (data.isEmpty) {
        navigate("/GalleryAdmin");
      } else if (data.redirectTo) {
        navigate(`/GalleryViewAdmin/${data.redirectTo}`);
      } else {
        navigate("/GalleryAdmin");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      addToast(error.response?.data?.error || "Error al eliminar la imagen", "danger");
    }
  };

  // Aceptar comentario
  const handleApproveComment = async (commentId) => {
    try {
      const res = await api.put(`/gallery/accept/${commentId}`);

      // Actualizar lista de comentarios públicos pendientes
      setPublicComments(prev => prev.filter(c => c.CommentId !== commentId));

      // Si ya no hay comentarios en la página actual, ir a la anterior
      if (currentModalComments.length === 1 && currentModalPage > 1) {
        setCurrentModalPage(prev => prev - 1);
      }

      // Recargar comentarios de la imagen actual
      await refreshComments();
      addToast("Comentario aceptado correctamente", "success");
    } catch (err) {
      console.error("Error al aceptar comentario:", err);
      addToast(err.response?.data?.error || "Error al aceptar el comentario", "danger");
    }
  };

  // Rechazar comentario
  const handleRejectComment = async (commentId) => {
    try {
      const res = await api.put(`/gallery/remove/${commentId}`);

      // Actualizar lista de comentarios públicos pendientes
      setPublicComments(prev => prev.filter(c => c.CommentId !== commentId));

      // Si ya no hay comentarios en la página actual, ir a la anterior
      if (currentModalComments.length === 1 && currentModalPage > 1) {
        setCurrentModalPage(prev => prev - 1);
      }

      // Recargar comentarios de la imagen actual
      await refreshComments();
      addToast("Comentario rechazado correctamente", "success");
    } catch (err) {
      console.error("Error al rechazar comentario:", err);
      addToast(err.response?.data?.error || "Error de conexión al rechazar el comentario", "danger");
    }
  };

  const commentsPerPage = 4;
  const totalModalPages = Math.ceil(publicComments.length / commentsPerPage);
  const currentModalComments = publicComments.slice(
    (currentModalPage - 1) * commentsPerPage,
    currentModalPage * commentsPerPage
  );

  if (loading) {
    return (
      <div className="gallery-page">
        <HeaderAdm />
        <div style={{ textAlign: "center", marginTop: 80, padding: "20px" }}>
          <p>Cargando imagen...</p>
        </div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="gallery-page">
        <HeaderAdm />
        <div style={{ textAlign: "center", marginTop: 80, padding: "20px" }}>
          <p>{error || "No se encontró la imagen seleccionada."}</p>
          <button className="btn-secondary-custom mt-3" onClick={() => navigate(-1)}>
            Volver a la galería
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <HeaderAdm />

      <div className="gallery-wrapper mx-auto">
        {/* Imagen principal con navegación */}
        <div className="image-section">
          <div className="main-image-wrapper" style={{ position: "relative" }}>
            {/* Botón anterior */}
            <button
              className="pagination-arrow"
              onClick={goToPrevImage}
              disabled={!navigation?.hasPrev}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
              </svg>
            </button>

            <img src={image.src} alt={image.alt} className="main-image" />

            {/* Botón siguiente */}
            <button
              className="pagination-arrow"
              onClick={goToNextImage}
              disabled={!navigation?.hasNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
              </svg>
            </button>

            {/* Contador de posición */}
            {navigation && (
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  fontSize: "14px",
                }}
              >
                {navigation.currentPosition} / {navigation.totalImages}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <aside className="comments-panel">
          <button className="btn-secondary-custom mb-3 w-100" onClick={() => navigate(-1)}>
            Volver a la galería
          </button>
          <button
            className="btn-secondary-custom mb-3 w-100"
            onClick={requestDeleteImage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
            </svg>
            Eliminar foto
          </button>

          <h3 className="panel-title">Comentarios ({comments.length})</h3>

          <div className="comments-list">
            {comments.length ? (
              comments.map((c) => (
                <div key={c.CommentId} className="comment-card">
                  <p className="comment-text">{c.CommentText}</p>
                  <span className="comment-author">
                    — {c.UserName || "Usuario"}
                    <small style={{ fontSize: "10px", marginLeft: "8px", display: "block" }}>
                      {new Date(c.PublicationDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </small>
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#6c757d" }}>
                <p className="no-comments">No hay comentarios aún</p>
                <small>Sé el primero en agregar uno</small>
              </div>
            )}
          </div>

          <button className="btn-primary-custom w-100 mt-auto" onClick={openCommentModal}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor" style={{ marginRight: "8px" }}>
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
            </svg>
            Revisar Comentarios
          </button>
        </aside>
      </div>

      {/* Modal de comentarios */}
      {showCommentModal && (
        <>
          <div className="modal-overlay" onClick={closeCommentModal}></div>
          <div className="comment-modal mt-4">


            <header className="modal-header">
              <h3 className="modal-title">
                Comentarios Pendientes
              </h3>
              <p className="modal-subtitle">
                Imagen seleccionada: <span>#{image.ImgId}</span>
              </p>
            </header>

            <div className="modal-body">
              {currentModalComments.length > 0 ? (
                currentModalComments.map((c) => (
                  <div key={c.CommentId} className="modal-comment-item">
                    <div className="comment-content">
                      <p className="comment-text">
                        {c.CommentText}
                      </p>
                      <small className="comment-date">
                        {new Date(c.PublicationDate).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </small>
                    </div>

                    <div className="comment-actions">
                      <button
                        className="btn-primary-custom btn-action-g"
                        onClick={() => handleApproveComment(c.CommentId)}
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn-secondary-custom btn-action-g"
                        onClick={() => handleRejectComment(c.CommentId)}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No hay comentarios pendientes</p>
                </div>
              )}
            </div>

            {/* PAGINACIÓN */}
            {publicComments.length > commentsPerPage && (
              <div className="modal-pagination">
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentModalPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentModalPage === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                    <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
                  </svg>

                </button>

                <span className="page-info">
                  Página {currentModalPage} de{" "}
                  {Math.ceil(publicComments.length / commentsPerPage)}
                </span>

                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentModalPage((prev) =>
                      prev < Math.ceil(publicComments.length / commentsPerPage)
                        ? prev + 1
                        : prev
                    )
                  }
                  disabled={
                    currentModalPage ===
                    Math.ceil(publicComments.length / commentsPerPage)
                  }
                >

                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
                    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={closeCommentModal}>
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          handleDeleteImage();
          setShowConfirmModal(false);
        }}
        message="¿Estás seguro de que deseas eliminar esta imagen?"
        confirmText="Sí, eliminar"
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}