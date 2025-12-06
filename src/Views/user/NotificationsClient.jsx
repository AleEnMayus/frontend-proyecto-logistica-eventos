import React, { useEffect, useState } from "react";
import HeaderCl from "../../components/HeaderSidebar/HeaderCl";
import { translateRequestType, translateStatus } from "../../utils/FormatText";
import { socket } from "../../services/socket";
import api from '../../utils/axiosConfig';
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import "../CSS/Notification.css";

const baseURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const NotificationsClient = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("pendientes");
  const { toasts, addToast, removeToast } = useToast();

  const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = storedUser?.id;

  // --- Cargar solicitudes propias ---
  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      const data = res.data;
      const userRequests = data.filter((req) => req.UserId == userId);
      setNotifications(userRequests);
    } catch (err) {
      console.error(err);
      addToast("Error al cargar tus notificaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Socket: conexión y escucha ---
  useEffect(() => {
    if (!userId) return;

    socket.emit("joinRoom", userId);
    console.log(`Cliente conectado a sala user_${userId}`);

    // Escuchar cuando el admin cambia el estado de una solicitud
    socket.on("notification:client", (data) => {
      console.log("Nueva notificación cliente:", data);
      addToast(data.message, "info");

      // Si es una actualización de estado existente
      if (data.requestId) {
        setNotifications((prev) => {
          const exists = prev.find(n => n.RequestId === data.requestId);
          
          if (exists) {
            // Actualizar la solicitud existente con el nuevo estado y ManagementDate
            return prev.map(n => 
              n.RequestId === data.requestId 
                ? { 
                    ...n, 
                    RequestStatus: data.status || n.RequestStatus,
                    ManagementDate: data.managementDate || new Date().toISOString()
                  } 
                : n
            );
          } else {
            // Nueva solicitud
            return [
              {
                RequestId: data.requestId,
                RequestType: data.requestType,
                RequestDescription: data.message || "Nueva solicitud",
                RequestStatus: data.status || "pending",
                RequestDate: data.requestDate || new Date().toISOString(),
                ManagementDate: data.managementDate || null,
              },
              ...prev,
            ];
          }
        });
      }
    });

    return () => {
      socket.off("notification:client");
    };
  }, [userId, addToast]);

  useEffect(() => {
    fetchRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Separar notificaciones por estado
  const pendientes = notifications.filter((n) => n.RequestStatus === "pending");
  const gestionadas = notifications.filter((n) => n.RequestStatus !== "pending");

  // Obtener las notificaciones según la sección activa
  const currentNotifications = activeSection === "pendientes" ? pendientes : gestionadas;

  return (
    <div className="contratos-container">
      <HeaderCl />
      <div className="notificaciones-container">
        <div className="header-notificaciones">
          <h1 className="titulo">Mis Notificaciones</h1>
          
          <div className="toggle-section">
            <button
              className={`toggle-btn ${activeSection === "pendientes" ? "active" : ""}`}
              onClick={() => setActiveSection("pendientes")}
            >
              Pendientes ({pendientes.length})
            </button>
            <button
              className={`toggle-btn ${activeSection === "gestionadas" ? "active" : ""}`}
              onClick={() => setActiveSection("gestionadas")}
            >
              Gestionadas ({gestionadas.length})
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : notifications.length === 0 ? (
          <p>No tienes notificaciones por ahora</p>
        ) : (
          <div className="lista">
            {currentNotifications.length === 0 ? (
              <p>No hay notificaciones en esta sección</p>
            ) : (
              currentNotifications.map((n) => (
                <div
                  key={n.RequestId}
                  className={`card ${
                    n.RequestStatus !== "pending" ? `card-${n.RequestStatus}` : ""
                  }`}
                  data-status={n.RequestStatus}
                >
                  <h2>{translateRequestType(n.RequestType)}</h2>
                  <p>{n.RequestDescription}</p>
                  <p className={`estado estado-${n.RequestStatus}`}>
                    Estado: {translateStatus(n.RequestStatus)}
                  </p>
                  <p className="fecha-gestion">
                    Fecha de solicitud: {new Date(n.RequestDate).toLocaleString("es-ES")}
                  </p>
                  {n.ManagementDate && (
                    <p className="fecha-gestion">
                      Gestionada: {new Date(n.ManagementDate).toLocaleString("es-ES")}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default NotificationsClient;