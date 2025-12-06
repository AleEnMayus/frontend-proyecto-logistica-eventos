import React, { useState } from "react";
import api from "../../../utils/axiosConfig";
import ConfirmModal from "../../Modals/ModalConfirm"; 
import '../../../Views/CSS/Modals.css';
import '../../../Views/CSS/components.css';

const PromotionModal = ({ promo, onClose, refreshPromos }) => {
  const [form, setForm] = useState({
    PromotionId: promo.PromotionId,
    TitleProm: promo.TitleProm,
    DescriptionProm: promo.DescriptionProm,
    Price: promo.Price
  });

  // Estado para mostrar el modal de confirmación
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updatePromo = async () => {
    await api.put("/promotions", form);
    refreshPromos();
    onClose();
  };

  const deletePromo = async () => {
    await api.delete(`/promotions/${form.PromotionId}`);
    refreshPromos();
    onClose();
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <div className="modal-overlay">
        <div className="profile-modal w-800">
          <button className="close-btn" onClick={onClose}>×</button>

          <h2 className="text-center mb-4">Editar Promoción</h2>

          <label className="field-label">Título</label>
          <input
            name="TitleProm"
            className="field-value mb-3"
            value={form.TitleProm}
            onChange={handleChange}
          />

          <label className="field-label">Descripción</label>
          <textarea
            name="DescriptionProm"
            className="field-value mb-3 min-h-200px"
            value={form.DescriptionProm}
            onChange={handleChange}
          />

          <label className="field-label">Precio</label>
          <input
            name="Price"
            type="number"
            className="field-value mb-4"
            value={form.Price}
            onChange={handleChange}
          />

          <div className="pm-footer">
            <button className="btn-secondary-custom btn" onClick={onClose}>
              Cerrar
            </button>

            {/* ABRIR MODAL DE CONFIRMACIÓN */}
            <button
              className="btn btn-danger btn"
              style={{ borderRadius: "25px", padding: "10px 22px" }}
              onClick={() => setShowConfirm(true)}
            >
              Eliminar
            </button>

            <button className="btn-primary-custom btn" onClick={updatePromo}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={deletePromo}
        message="¿Estás seguro de eliminar esta promoción?"
        confirmText="Eliminar"
      />
    </>
  );
};

export default PromotionModal;
