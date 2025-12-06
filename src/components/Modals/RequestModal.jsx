import React, { useState } from "react";
import "../../Views/CSS/Modals.css";
import api from '../../utils/axiosConfig';

const RequestModal = ({ isOpen, onClose, usert, requestType, eventId = null }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const stop = (e) => e.stopPropagation();

  const SendReason = async () => {
    if (!reason.trim()) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        RequestDate: new Date().toISOString(),
        RequestDescription: reason,
        RequestType: requestType,
        UserId: user?.id,
        // Aseguramos que si es cancel_event siempre incluya el EventId
        ...(requestType === "cancel_event" && { EventId: eventId }),
      };

      const res = await api.post('/requests', payload);
      const data = res.data;
      setReason("");
      onClose();
    } catch (err) {
      console.error("Error de red:", err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const requestConfig = {
    schedule_appointment: {
      title: "Solicitud de agendamiento de cita",
      placeholder: "Indique la fecha, hora y motivo de la cita...",
    },
    cancel_event: {
      // Mostramos el ID del evento para más claridad
      title: `Solicitud de cancelación de evento${eventId ? ` #${eventId}` : ""}`,
      placeholder: "Explique el motivo por el cual desea cancelar el evento...",
    },
    document_change: {
      title: "Solicitud de cambio de documento",
      placeholder: "Escriba el documento y por qué desea cambiarlo...",
    },
  };

  const config = requestConfig[requestType] || {
    title: "Nueva Solicitud",
    placeholder: "Describa su solicitud...",
  };

  return (
    <div className="sidebar-overlay active" onClick={onClose}>
      <div
        className="profile-modal w-800 position-absolute top-50 start-50 translate-middle"
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
        <button className="close-btn" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>

        <h4 className="modal-title text-center mb-3">{config.title}</h4>

        <div className="pm-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="field-row w-100">
            <div className="field">
              <div className="field-label">Motivo</div>
              <textarea
                className="field-value w-100 min-h-200px"
                placeholder={config.placeholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="text-start small text-muted mt-0 mb-3">
          {500 - reason.length} caracteres restantes
        </div>

        <button
          className="btn-primary-custom btn w-100"
          onClick={SendReason}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default RequestModal;