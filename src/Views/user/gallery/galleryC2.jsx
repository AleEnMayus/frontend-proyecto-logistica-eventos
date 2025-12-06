import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import "../../CSS/GalleryView.css";
import "../../CSS/components.css";
import HeaderCl from "../../../components/HeaderSidebar/HeaderCl";
import { useParams, useNavigate } from "react-router-dom";

// toast
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";

// ================================
// Funciones Fetch del cliente
// ================================
async function getImageById(id) {
  const response = await api.get(`/gallery/${id}`);
  return response.data;
}

async function getComments(imageId) {
  const response = await api.get(`/gallery/${imageId}/comments`);
  return response.data;
}

async function addCommentToImage(imageId, text) {
  // Recuperamos el usuario del localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  if (!userId) {
    throw new Error("Usuario no autenticado");
  }

  if (!text || !text.trim()) {
    throw new Error("El comentario no puede estar vacío");
  }

  const response = await api.post(`/gallery/${imageId}/comments`, {
    UserId: userId,
    CommentText: text.trim()
  });

  return response.data;
}


// ================================
// Componente principal
// ================================
const ImageGalleryViewerC = () => {
  const { ImgId } = useParams();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [imageData, setImageData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ImgId) loadImage(ImgId);
  }, [ImgId]);

  const loadImage = async (id) => {
    try {
      setLoading(true);
      const data = await getImageById(id);
      setImageData(data);

      const commentsData = await getComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error cargando imagen:", error);
      addToast("Error al cargar imagen", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addCommentToImage(imageData.FileId, newComment);
      setNewComment("");
      const updated = await getComments(imageData.FileId);
      setComments(updated);
      addToast("Comentario en espera, ¡Espera a que el admin lo acepte!", "info");
    } catch (err) {
      console.error("Error al añadir comentario:", err);
      addToast(err.message || "Error al añadir comentario", "danger");
    }
  };

  const handlePrevImage = () => {
    if (imageData?.navigation?.hasPrev) {
      navigate(`/GalleryView/${imageData.navigation.prevId}`);
    }
  };

  const handleNextImage = () => {
    if (imageData?.navigation?.hasNext) {
      navigate(`/GalleryView/${imageData.navigation.nextId}`);
    }
  };

  if (loading) return <div className="loading">Cargando imagen...</div>;

  return (
    <div className="gallery-page">
      <HeaderCl />
      <div className="gallery-wrapper mx-auto">
        {/* Imagen principal */}
        <div className="image-section">
          <div className="main-image-wrapper">
            {/* Botón anterior */}
            <button
              className="pagination-arrow"
              onClick={handlePrevImage}
              disabled={!imageData?.navigation?.hasPrev}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="currentColor"
              >
                <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
              </svg>
            </button>

            {/* Imagen */}
            {imageData ? (
              <img
                src={imageData.url}
                alt={imageData.FileName}
                className="main-image"
              />
            ) : (
              <div className="placeholder-image">Sin imagen</div>
            )}

            {/* Botón siguiente */}
            <button
              className="pagination-arrow"
              onClick={handleNextImage}
              disabled={!imageData?.navigation?.hasNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="currentColor"
              >
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
              </svg>
            </button>

            {/* Contador */}
            {imageData?.navigation && (
              <div className="position-counter">
                {imageData.navigation.currentPosition} / {imageData.navigation.totalImages}
              </div>
            )}
          </div>
        </div>

        {/* Panel de comentarios */}
        <div className="comments-panel">
          <div className="panel-title">Comentarios</div>

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.CommentId} className="comment-card">
                  <div className="comment-text">{comment.CommentText}</div>
                  <div className="comment-author">
                    {comment.UserName} —{" "}
                    {new Date(comment.PublicationDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <small className="no-comments mb-4">No hay comentarios para esta imagen</small >
            )}
          </div>

          <div className="commentInput ">
            <div className="panel-title">Añadir comentario</div>
            <div className="d-flex g-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario aquí..."
                className="commentInput-area"
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter") handleAddComment();
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="sendcomment-button"
                
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
            </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ImageGalleryViewerC;