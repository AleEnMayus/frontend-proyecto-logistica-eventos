import React from "react";
import "../../../Views/CSS/Modals.css";
import "../../../Views/CSS/components.css";

const ModalPromotionView = ({ promo, onClose }) => {
  if (!promo) return null;

  return (
    <div className="modal-overlay">
      <div className="profile-modal w-800">

        {/* Botón X (arriba derecha) */}
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="text-center mb-4">{promo.TitleProm}</h2>

        {/* Descripción */}
        <div className="mb-3">
          <label className="fw-bold">Descripción:</label>
          <p className="modal-description">
            {promo.DescriptionProm}
          </p>
        </div>

        {/* Precio */}
        <div className="mb-3">
          <label className="fw-bold">Precio:</label>
          <p className="modal-description">
            ${promo.Price}
          </p>
        </div>

        {/* Botón cerrar alineado a la izquierda */}
        <div className="mt-4" style={{ textAlign: "left" }}>
          <button className="btn-secondary-custom btn" onClick={onClose}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalPromotionView;
