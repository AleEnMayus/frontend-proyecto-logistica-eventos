import React, { useState } from "react";
import "./Modals.css";

const RequestModal = ({ isOpen, onClose, requestType, eventId = null }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const stop = (e) => e.stopPropagation();

  const SendReason = async () => {
    // Validaciones básicas
    if (!reason.trim()) {
      setError("Por favor ingrese un motivo");
      return;
    }

    if (!user?.id) {
      setError("No se encontró la información del usuario");
      return;
    }

    if (requestType === "cancel_event" && !eventId) {
      setError("No se proporcionó el ID del evento a cancelar");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        userId: user.id,
        requestType,
        reason: reason.trim(),
        eventId: eventId || undefined,
      };

      // Enviar solicitud al backend
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar la solicitud');
      }

      setSuccess(true);
      setReason("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  

  const requestConfig = {
    schedule_appointment: {
      title: "Solicitud de agendamiento de cita",
      placeholder: "Indique la fecha, hora y motivo de la cita..."
    },
    cancel_event: {
      title: `Solicitud de cancelación de evento${eventId ? ` #${eventId}` : ""}`,
      placeholder: "Explique el motivo por el cual desea cancelar el evento..."
    },
    document_change: {
      title: "Solicitud de cambio de documento",
      placeholder: "Escriba el documento y por qué desea cambiarlo..."
    },
  };

  const config = requestConfig[requestType] || {
    title: "Nueva Solicitud",
    placeholder: "Describa su solicitud..."
  };

  return (
    <div className="sidebar-overlay active" onClick={onClose}>
      <div
        className="profile-modal w-800 position-absolute top-50 start-50 translate-middle"
        onClick={stop}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
      >
        <button 
          className="close-btn" 
          aria-label="Cerrar" 
          onClick={onClose}
          disabled={loading}
          style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ×
        </button>

        <h4 className="modal-title text-center mb-3">
          {config.title}
        </h4>

        <div className="pm-body">
          {/* Mensaje de error */}
          {error && (
            <div 
              className="alert alert-danger" 
              role="alert"
              style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '8px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c2c7',
                color: '#842029'
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div 
              className="alert alert-success" 
              role="alert"
              style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '8px',
                backgroundColor: '#d1e7dd',
                border: '1px solid #badbcc',
                color: '#0f5132'
              }}
            >
              <strong>Éxito:</strong> Solicitud enviada correctamente
            </div>
          )}

          <div className="field-row w-100">
            <div className="field">
              <div className="field-label" style={{ fontWeight: '600', marginBottom: '8px' }}>
                Motivo *
              </div>
              <textarea
                className="field-value w-100 min-h-200px"
                placeholder={config.placeholder}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(""); // Limpiar error al escribir
                }}
                rows={6}
                maxLength={500}
                disabled={loading || success}
                style={{
                  resize: 'vertical',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        <div 
          className="text-start small text-muted mt-2 mb-3"
          style={{ fontSize: '12px' }}
        >
          {500 - reason.length} caracteres restantes
        </div>

        <button
          className="btn-primary-custom btn w-100"
          onClick={SendReason}
          disabled={loading || success || !reason.trim()}
          style={{
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px',
            opacity: (loading || success || !reason.trim()) ? 0.6 : 1,
            cursor: (loading || success || !reason.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Enviando..." : success ? "Enviado" : "Enviar solicitud"}
        </button>

        {/* Info adicional para cancelaciones */}
        {requestType === "cancel_event" && (
          <div 
            className="text-center small text-muted mt-3"
            style={{ fontSize: '12px', fontStyle: 'italic' }}
          >
            Recuerda: Las cancelaciones deben realizarse con al menos 20 días de anticipación
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestModal;