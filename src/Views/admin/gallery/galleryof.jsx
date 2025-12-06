import React, { useState } from "react";
import "../../CSS/Modals.css";

const UploadPhotoModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "Subir Foto"
}) => {
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!show) return null;

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (foto) {
      onConfirm(foto);
      handleClose();
    }
  };

  const handleClose = () => {
    setFoto(null);
    setPreview(null);
    onClose();
  };

  const handleEliminar = () => {
    setFoto(null);
    setPreview(null);
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}></div>
      
      <div 
        className="profile-modal mt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button className="close-btn" onClick={handleClose}>
          &times;
        </button>

        {/* Título */}
        <h3 className="modal-message" style={{ fontWeight: "bold", textAlign: "center", margin: "10px 0 20px 0" }}>
          {title}
        </h3>

        {/* Cuerpo del modal */}
        <div className="pm-body" style={{ flexDirection: "column", alignItems: "center" }}>
          {/* Zona de Drop & Upload */}
          <div 
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileChange(file);
            }}
            onClick={() => document.getElementById("photoInput").click()}
            style={{ cursor: "pointer", width: "100%" }}
          >
            {preview ? (
              <div style={{ textAlign: "center" }}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "200px", 
                    objectFit: "contain",
                    marginBottom: "10px",
                    borderRadius: "8px"
                  }} 
                />
                <p><strong>Archivo:</strong> {foto.name}</p>
              </div>
            ) : (
              <>
                <p>Arrastra y suelta una foto aquí o haz clic para seleccionarla</p>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                  <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                </svg>  
              </>
            )}
            <input 
              id="photoInput"
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>

          {/* Botón de eliminar foto */}
          {foto && (
            <button 
              onClick={handleEliminar} 
              className="btn-secondary-custom"
              style={{ width: "100%", marginTop: "15px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className='me-2' height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
              </svg>
              Eliminar foto
            </button>
          )}
        </div>

        {/* Footer con botones */}
        <div className="pm-footer">
          <button 
            className="btn-primary-custom w-100" 
            onClick={handleConfirm}
            disabled={!foto}
          >
            Confirmar
          </button>
          <button className="btn-secondary-custom w-100" onClick={handleClose}>
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};

export default UploadPhotoModal;