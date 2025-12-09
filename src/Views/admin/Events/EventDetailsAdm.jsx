import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/axiosConfig';
import { translateStatus } from '../../../utils/FormatText';
import '../../CSS/components.css';
import '../../CSS/DetailsEvt.css';
import HeaderAdm from '../../../components/HeaderSidebar/HeaderAdm';
import ModalState from '../../../components/Modals/ModalState';
import ModalViewResources from "./ModalViewResources";

import { useToast } from '../../../hooks/useToast';
import ToastContainer from '../../../components/ToastContainer';

const EventDetailsA = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStateModal, setShowStateModal] = useState(false);

  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [resources, setResources] = useState([]);

  const { toasts, addToast, removeToast } = useToast();

  const fetchEventDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/events/${id}`);
      setEventData(response.data);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(`Error al cargar el evento: ${err.response?.data?.error || err.message}`);
      addToast("No se pudo cargar el evento", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  // Obtener datos del cliente
  useEffect(() => {
    const loadClientData = async () => {
      if (!eventData || !eventData.ClientId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/accounts/${eventData.ClientId}`
        );

        const userData = response.data;
        setClientData({
          name: userData.Names || "N/A",
          email: userData.Email || "Sin correo",
          documentType: userData.DocumentType || "",
          documentNumber: userData.DocumentNumber || "",
        });
      } catch (error) {
        console.error("Error cargando datos del cliente:", error);
        setClientData({
          name: eventData.ClientName || "Error al cargar",
          email: "Sin información",
          documentType: "",
          documentNumber: "",
        });
        addToast("Error al cargar datos del cliente", "danger");
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [eventData]);

  const handleEditEvent = () => navigate(`/EditEvent/${eventId}`);
  const handleGoBack = () => navigate(-1);
  const handleOpenStatusModal = () => setShowStateModal(true);

  const handleStatusChangeFromModal = async (id, newStatus) => {
    try {
      const response = await api.patch(`/events/${id}/status`, {
        EventStatus: newStatus
      });

      setEventData((prev) => ({
        ...prev,
        EventStatus: newStatus
      }));

      setShowStateModal(false);
      addToast("Estado del evento actualizado correctamente", "success");
    } catch (err) {
      console.error('Error cambiando estado:', err);
      addToast("No se pudo cambiar el estado del evento", "danger");
    }
  };

  const handleSend = (eventId) => {
    navigate(`/SendContractsAdmin/${eventId}`);
  };

  //  ***MODIFICADO AQUÍ*** → ahora toma los recursos directamente del evento
  const handleResources = () => {
    if (!eventData || !eventData.resources) {
      addToast("Este evento no tiene recursos asignados", "info");
      return;
    }

    setResources(eventData.resources);
    setShowResourcesModal(true);
  };

  if (loading) {
    return (
      <div className="content-container">
        <HeaderAdm />
        <div className="loading-message">Cargando detalles del evento...</div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <HeaderAdm />
        <div className="error-message">
          {error}
          <button onClick={() => fetchEventDetails(eventId)} className="btn-primary-custom">
            Reintentar
          </button>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="content-container">
        <HeaderAdm />
        <div className="no-data-message">No se encontraron detalles para este evento.</div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="content-container">
      <HeaderAdm />

      {/* Card de cliente */}
      <div className="user-card">
        <div className="user-info">
          <div className="avatar">
            {clientData?.name ? clientData.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="user-label">Cliente</p>
            <p className="user-name">{clientData?.name || eventData.ClientName || "N/A"}</p>
            <p className="user-email">{clientData?.email || "Sin correo"}</p>
            {clientData?.documentNumber && (
              <p className="user-email">
                {clientData.documentType} {clientData.documentNumber}
              </p>
            )}
          </div>
        </div>

        <div className="event-status">
          <p className="status-title">Estado del evento</p>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">{translateStatus(eventData.EventStatus) || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="details-grid">

        <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
          <span className="detail-label">Nombre del evento</span>
          <div className="detail-box">{eventData.EventName || "N/A"}</div>
        </div>

        <div className="detail-item">
          <span className="detail-label">Fecha y hora</span>
          <div className="detail-box">
            {eventData.EventDateTime
              ? new Date(eventData.EventDateTime).toLocaleString()
              : "N/A"}
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label">Capacidad</span>
          <div className="detail-box">{eventData.Capacity || "N/A"}</div>
        </div>

        <div className="detail-item">
          <span className="detail-label">Precio</span>
          <div className="detail-box">${eventData.EventPrice || "N/A"}</div>
        </div>

        <div className="detail-item">
          <span className="detail-label">Método de pago</span>
          <div className="detail-box">
            {translateStatus(eventData.AdvancePaymentMethod) || "N/A"}
          </div>
        </div>

        {/* BOTÓN RECURSOS */}
        <div className="detail-item">
          <span className="detail-label">Recursos Asignados</span>
          <button
            className="btn-primary-custom btn"
            onClick={handleResources}
            style={{ width: "100%" }}
          >
            Ver Recursos Asignados
          </button>
        </div>

        <div className="detail-item">
          <span className="detail-label">Dirección</span>
          <div className="detail-box">{eventData.Address || "N/A"}</div>
        </div>

        <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
          <span className="detail-label">Descripción</span>
          <div className="detail-box">{eventData.EventDescription || "N/A"}</div>
        </div>
      </div>

      <div className="button-container">
        {eventData.EventStatus === "In_planning" && (
          <>
            <button
              className="btn-primary-custom btn"
              onClick={() => handleSend(eventId)}
            >
              Enviar contrato
            </button>
            <button
              className="btn-primary-custom btn"
              onClick={handleEditEvent}
            >
              Editar evento
            </button>
          </>
        )}

        <button className="btn-primary-custom btn" onClick={handleOpenStatusModal}>
          Cambiar estado
        </button>
        <button className="btn-secondary-custom btn" onClick={handleGoBack}>
          Volver
        </button>
      </div>

      {/* MODAL ESTADO */}
      <ModalState
        show={showStateModal}
        onClose={() => setShowStateModal(false)}
        onConfirm={handleStatusChangeFromModal}
        currentStatus={eventData.EventStatus}
        entityId={eventData.EventId}
        options={["In_planning", "In_execution", "Completed", "Canceled"]}
        title="Cambiar estado de evento"
      />

      {/* MODAL DE RECURSOS */}
      {showResourcesModal && (
        <ModalViewResources
          resources={resources}
          onClose={() => setShowResourcesModal(false)}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default EventDetailsA;
