import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/axiosConfig';
import HeaderCl from "../../../components/HeaderSidebar/HeaderCl";
import RequestModal from '../../../components/Modals/RequestModal';
import '../../CSS/components.css';
import '../../CSS/DetailsEvt.css';
import { translateStatus } from '../../../utils/FormatText';

const EventDetailsC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Obtener usuario de localStorage
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Fetch evento
  const fetchEventDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/events/${id}`);
      const data = response.data;

      // Validar que el evento le pertenece al usuario
      if (currentUser && data.ClientId !== currentUser.id) {
        setError("No tienes permisos para ver este evento.");
        setEventData(null);
        return;
      }

      setEventData(data);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err.response?.data?.error || `Error al cargar el evento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cliente
  useEffect(() => {
    const loadClientData = async () => {
      if (!eventData?.ClientId) return;

      try {
        const response = await api.get(`/accounts/${eventData.ClientId}`);
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
      }
    };

    loadClientData();
  }, [eventData]);

  // Cargar evento cuando cambia el ID
  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="content-container">
        <HeaderCl />
        <div className="loading-message">Cargando detalles del evento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <HeaderCl />
        <div className="error-message">
          {error}
          <button
            onClick={() => fetchEventDetails(eventId)}
            className="btn-primary-custom btn"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="content-container">
        <HeaderCl />
        <div className="no-data-message">
          No se encontraron detalles para este evento.
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <HeaderCl />

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
        <div className="detail-item">
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
          <span className="detail-label">Dirección</span>
          <div className="detail-box">{eventData.Address || "N/A"}</div>
        </div>
        <div className="detail-item">
          <span className="detail-label">Método de pago</span>
          <div className="detail-box">{translateStatus(eventData.AdvancePaymentMethod) || "N/A"}</div>
        </div>
        <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
          <span className="detail-label">Descripción</span>
          <div className="detail-box">{eventData.EventDescription || "N/A"}</div>
        </div>
      </div>

      {/* Botones */}
      <div className="button-container">
        <button className="btn-primary-custom btn"onClick={() => setModalOpen(true)}>
          Cancelar evento
        </button>
        <button className="btn-secondary-custom back-button btn" onClick={handleGoBack}>
          Volver
        </button>
      </div>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        requestType="cancel_event"
        eventId={eventData.EventId}
      />
    </div>
  );
};

export default EventDetailsC;