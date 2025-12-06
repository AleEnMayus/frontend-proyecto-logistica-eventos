import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import "../../CSS/components.css";
import "../../CSS/Lists.css";
import "../../CSS/Modals.css";

const EditResource = ({ resource, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ResourceId: "",
    ResourceName: "",
    ResourceCode: "",
    Quantity: "",
    Status: "Available",
    StatusDescription: "",
    Price: "",
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        ResourceId: resource.ResourceId,
        ResourceName: resource.ResourceName || "",
        ResourceCode: resource.ResourceCode || "",
        Quantity: resource.Quantity || "",
        Status: resource.Status || "Available",
        StatusDescription: resource.StatusDescription || "",
        Price: resource.Price || "",
      });
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/resources/${formData.ResourceId}`, formData);
      const data = res.data;
      onSave(data); // Notifica al padre
    } catch (err) {
      console.error("Error actualizando recurso:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <button className="close-btn" onClick={onCancel}>×</button>
        <div className="pm-body">
          <div className="pm-fields w-100">
            <h3 className="text-center mb-3">Editar Recurso</h3>
            <form onSubmit={handleSubmit}>
              <div className="field-row two-cols">
                <div className="field">
                  <label className="field-label">Nombre</label>
                  <input type="text" name="ResourceName" value={formData.ResourceName} onChange={handleChange} className="field-value" required />
                </div>
                <div className="field">
                  <label className="field-label">Cantidad</label>
                  <input type="number" name="Quantity" value={formData.Quantity} onChange={handleChange} className="field-value" required />
                </div>
              </div>
              <div className="field-row two-cols">
                <div className="field">
                  <label className="field-label">Estado</label>
                  <select name="Status" value={formData.Status} onChange={handleChange} className="field-value">
                    <option value="Available">Disponible</option>
                    <option value="In_use">En uso</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Precio</label>
                  <input type="number" step="0.01" name="Price" value={formData.Price} onChange={handleChange} className="field-value" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Descripción</label>
                <textarea name="StatusDescription" value={formData.StatusDescription} onChange={handleChange} className="field-value min-h-200px" />
              </div>
              <div className="pm-footer">
                <button type="button" className="btn-secondary-custom btn" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn-primary-custom btn">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResource;
