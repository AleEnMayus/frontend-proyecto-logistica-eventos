import React, { useState, useEffect } from 'react';
import { eraseUnderscore } from '../../utils/FormatText';
import "../../Views/CSS/Modals.css";

const ModalState = ({ 
  show, 
  onClose, 
  onConfirm,    // recibe la acción confirmada
  currentStatus, 
  entityId,     // id del usuario/evento que quieres modificar
  options = [], 
  title = "Cambiar estado"
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus); // resetea al abrir el modal
  }, [currentStatus, show]);

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  const handleStatusChange = () => {
    if (selectedStatus) {
      onConfirm(entityId, selectedStatus); // envía id + nuevo estatus
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="sidebar-overlay active">
      <div className="profile-modal mt-5">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="modal-title text-center">{title}</h2>

        {/* Opciones de estados */}
        <div className="status-options d-flex flex-column text-center">
          {options.slice(0, 3).map((status) => (
            <div
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`status-option ${selectedStatus === status ? "selected" : ""}`}
            >
              <div className="status-box">
                {selectedStatus === status && 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill='#f5f0ff'>
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                  </svg>
                }
              </div>
              <span className="status-label">{eraseUnderscore(status)}</span>
            </div>
          ))}
        </div>

        <div className="pm-footer">
          <button 
            onClick={handleStatusChange}
            disabled={!selectedStatus}
            className="btn-primary-custom btn w-100"
          >
            Cambiar
          </button>
          <button className="btn-secondary-custom btn w-100" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalState;