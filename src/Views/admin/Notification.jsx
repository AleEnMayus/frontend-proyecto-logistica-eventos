import React, { useState, useEffect } from "react";
import HeaderAdm from "../../components/HeaderSidebar/HeaderAdm";
import { translateRequestType, translateStatus } from "../../utils/FormatText";
import { useToast } from "../../hooks/useToast";
import { socket } from "../../services/socket";
import api from '../../utils/axiosConfig';
import ToastContainer from "../../components/ToastContainer";
import "../CSS/Notification.css";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("Todo");
  const [showManaged, setShowManaged] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());
  const { toasts, addToast, removeToast } = useToast();

  // --- Cargar solicitudes desde API ---
  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      const data = res.data;
      setRequests(data);
    } catch (err) {
      console.error(err);
      addToast("Error al cargar notificaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Actualizar estado de solicitud ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Usamos cookies HttpOnly, no necesitamos token en JS

      // Agregar ID al set de elementos que se están removiendo
      setRemovingIds(prev => new Set(prev).add(id));

      // Esperar 300ms para que se complete la animación de salida
      await new Promise(resolve => setTimeout(resolve, 300));

      const res = await api.put(`/requests/${id}/status`, { status: newStatus });
      const updatedRequest = res.data;

      addToast(
        newStatus === "approved" ? "Solicitud aceptada" : "Solicitud rechazada",
        "success"
      );

      // Actualizar el estado de la solicitud con los nuevos datos
      setRequests(prev =>
        prev.map(r =>
          r.RequestId === id 
            ? { 
                ...r, 
                RequestStatus: newStatus,
                ManagementDate: new Date().toISOString(),
                ...updatedRequest 
              } 
            : r
        )
      );

      // Remover del set de elementos que se están removiendo
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // Emitir evento de actualización para otros admins conectados
      socket.emit("request:updated", {
        requestId: id,
        status: newStatus,
        updatedRequest
      });

    } catch (err) {
      console.error(err);
      addToast(err.message || "Error al actualizar la solicitud", "error");
      
      // En caso de error, remover del set de elementos que se están removiendo
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // --- Inicializar solicitudes al montar ---
  useEffect(() => {
    fetchRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Conectar al socket y escuchar eventos en tiempo real ---
  useEffect(() => {
    if (!socket.connected) {
      console.log("Conectando socket...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
    });

    socket.on("notification:admin", (data) => {
      console.log("Nueva notificación recibida:", data);
      
      setRequests(prev => {
        const exists = prev.some(r => r.RequestId === data.requestId);
        if (exists) return prev;

        return [
          {
            RequestId: data.requestId,
            RequestType: data.requestType,
            RequestDescription: data.message || data.description || "Nueva solicitud",
            RequestStatus: "pending",
            UserId: data.userId,
            RequestDate: data.requestDate || new Date().toISOString(),
            ManagementDate: null,
          },
          ...prev,
        ];
      });

      addToast(`Nueva solicitud: ${translateRequestType(data.requestType)}`, "info");
      playNotificationSound();
    });

    socket.on("request:updated", (data) => {
      console.log("Solicitud actualizada por otro admin:", data);
      
      setRequests(prev =>
        prev.map(r =>
          r.RequestId === data.requestId
            ? { 
                ...r, 
                RequestStatus: data.status, 
                ManagementDate: new Date().toISOString(), 
                ...data.updatedRequest 
              }
            : r
        )
      );

      addToast(`Solicitud ${translateStatus(data.status)} por otro administrador`, "info");
    });

    socket.on("request:deleted", (data) => {
      console.log("Solicitud eliminada:", data);
      
      setRequests(prev => prev.filter(r => r.RequestId !== data.requestId));
      addToast("Una solicitud ha sido eliminada", "info");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("notification:admin");
      socket.off("request:updated");
      socket.off("request:deleted");
    };
  }, [addToast]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("No se pudo reproducir el sonido:", err));
    } catch (err) {
      console.log("Error al reproducir sonido:", err);
    }
  };

  // --- Filtrar solicitudes por estado y tipo ---
  const pendingRequests = requests.filter(n => n.RequestStatus === "pending");
  const managedRequests = requests.filter(n => n.RequestStatus !== "pending");
  const currentRequests = showManaged ? managedRequests : pendingRequests;

  const filtradas =
    activeTab === "Todo"
      ? currentRequests
      : currentRequests.filter((n) => {
          if (activeTab === "Citas") return n.RequestType === "schedule_appointment";
          if (activeTab === "Cancelación") return n.RequestType === "cancel_event";
          if (activeTab === "Documento") return n.RequestType === "document_change";
          return true;
        });

  return (
    <div className="contratos-container">
      <HeaderAdm />
      <div className="notificaciones-container">
        <div className="header-notificaciones">
          <h1 className="titulo">Notificaciones</h1>
          <div className="toggle-section">
            <button
              className={`toggle-btn ${!showManaged ? "active" : ""}`}
              onClick={() => setShowManaged(false)}
            >
              Pendientes ({pendingRequests.length})
            </button>
            <button
              className={`toggle-btn ${showManaged ? "active" : ""}`}
              onClick={() => setShowManaged(true)}
            >
              Gestionadas ({managedRequests.length})
            </button>
          </div>
        </div>

        <div className="tabs">
          {["Todo", "Citas", "Cancelación", "Documento"].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="lista">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor">
                <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
              </svg>
              <p>No hay notificaciones {showManaged ? "gestionadas" : "pendientes"}</p>
            </div>
          ) : (
            filtradas.map((n) => (
              <div
                key={n.RequestId}
                className={`card ${n.RequestStatus !== "pending" ? `card-${n.RequestStatus}` : ""} ${
                  removingIds.has(n.RequestId) ? "card-removing" : ""
                }`}
                data-status={n.RequestStatus}
              >
                <div className="card-header-not">
                  <h2>{translateRequestType(n.RequestType)}</h2>
                  <span className={`status-badge status-${n.RequestStatus}`}>
                    {translateStatus(n.RequestStatus)}
                  </span>
                </div>
                
                <p className="card-description">{n.RequestDescription}</p>
                
                <div className="card-footer-not">
                  <p className="fecha-solicitud">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                      <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/>
                    </svg>
                    Solicitada: {new Date(n.RequestDate).toLocaleString("es-ES", {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  
                  {n.ManagementDate && (
                    <p className="fecha-gestion">
                      <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                      </svg>
                      Gestionada: {new Date(n.ManagementDate).toLocaleString("es-ES", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                
                {n.RequestStatus === "pending" && (
                  <div className="acciones">
                    <button
                      className="btn-primary-custom"
                      onClick={() => handleStatusChange(n.RequestId, "approved")}
                      disabled={removingIds.has(n.RequestId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                      </svg>
                      Aceptar
                    </button>
                    <button
                      className="btn-secondary-custom"
                      onClick={() => handleStatusChange(n.RequestId, "rejected")}
                      disabled={removingIds.has(n.RequestId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                      </svg>
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Notifications;