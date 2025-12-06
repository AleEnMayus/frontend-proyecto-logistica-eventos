import React, { useState } from "react";
import api from "../../../utils/axiosConfig";
import '../../../Views/CSS/Modals.css';
import '../../../Views/CSS/components.css';

const ModalPromotionCreate = ({ onClose, refreshPromos }) => {
  const [formData, setFormData] = useState({
    TitleProm: "",
    DescriptionProm: "",
    Price: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/promotions", formData);
      refreshPromos();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal w-800">
        
        <button className="close-btn" onClick={onClose}>×</button>

        <h3 className="text-center mb-4">Crear Promoción</h3>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Título</label>
          <input
            type="text"
            name="TitleProm"
            className="field-value mb-3"
            value={formData.TitleProm}
            onChange={handleChange}
            required
          />

          <label className="field-label">Descripción</label>
          <textarea
            name="DescriptionProm"
            className="field-value mb-3 min-h-200px"
            value={formData.DescriptionProm}
            onChange={handleChange}
            required
          />

          <label className="field-label">Precio</label>
          <input
            type="number"
            name="Price"
            className="field-value mb-4"
            value={formData.Price}
            onChange={handleChange}
            required
          />

          <div className="pm-footer">
            <button type="button" className="btn-secondary-custom btn" onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className="btn-primary-custom btn" disabled={loading}>
              {loading ? "Guardando..." : "Crear Promoción"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ModalPromotionCreate;
