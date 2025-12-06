import React from "react";
import "../../Views/CSS/Modals.css";

const ConfirmModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  message, 
  confirmText = "Confirmar"
}) => {
  if (!show) return null;

  return (
    <div className="sidebar-overlay active" onClick={onClose}>
      <div className="profile-modal mt-5">
        {/* Botón de cerrar */}
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        {/* Mensaje */}
        <div className="pm-body" style={{ justifyContent: "center" }}>
          <p className="modal-message" style={{ fontWeight: "bold", textAlign: "center" }}>
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="pm-footer">
          <button className="btn-primary-custom btn w-100" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="btn-secondary-custom btn w-100 " onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
