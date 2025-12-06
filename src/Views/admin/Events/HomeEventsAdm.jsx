/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/axiosConfig';
import { translateStatus } from '../../../utils/FormatText';
import '../../CSS/components.css';
import '../../CSS/Lists.css';
import HeaderAdm from '../../../components/HeaderSidebar/HeaderAdm';

function EstadoBadge({ estado }) {
  const normalizado = String(estado || "")
    .normalize("NFD") // quita acentos
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const estilos = {
    "completado": { background: "#ffe6e6", color: "#ff0000", border: "1px solid #ff0000" },
    "en ejecucion": { background: "#e6ffe6", color: "#13a927", border: "1px solid #13a927" },
    "en planeacion": { background: "#fff4e0", color: "#ffae00", border: "1px solid #ffae00" },
    "cancelado": { background: "#f0f0f0", color: "#6c757d", border: "1px solid #6c757d" },
  };

  const estilo = estilos[normalizado] || { background: "#f0f0f0", color: "#6c757d" };

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "12px",
        fontWeight: "600",
        fontSize: "0.85rem",
        display: "inline-block",
        textTransform: "capitalize",
        ...estilo,
      }}
    >
      {estado || "N/A"}
    </span>
  );
}

const ListEventsA = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const eventsPerPage = 5;

  // Traer eventos desde API
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get("/events");
        setEventos(response.data);
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  // Filtro
  const eventosFiltrados = eventos.filter(evento =>
    evento.EventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.EventStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ver evento
  const handleVerEvento = (eventId) => {
    navigate(`/EventsHomeAdmin/Details/${eventId}`);
  };

  // Paginación
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = eventosFiltrados.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(eventosFiltrados.length / eventsPerPage);

  // Loading
  if (loading) {
    return (
      <div className="list-container mle-0">
        <HeaderAdm />
        <p className="mt-5 pt-5 text-center">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="list-container mle-0">
      <HeaderAdm />

      {/* Header */}
      <div className="list-header mt-3">
        <h2 className="list-title">LISTADO DE EVENTOS</h2>
        <Link to="/CreateEvent" className="btn-create btn">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffffff">
            <path d="M417-417H166v-126h251v-251h126v251h251v126H543v251H417v-251Z" />
          </svg>
          Agendar Evento
        </Link>
      </div>

      {/* Search Bar */}
      <div className="search-container mb-4 w-50-lg">
        <span className="search-label">Buscar eventos</span>
        <div className="search-input-group">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por evento o estado..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre del evento</th>
              <th>Cliente</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody className="events-tbody events-table">
            {currentEvents.map((evento) => {
              const fecha = new Date(evento.EventDateTime).toLocaleDateString();
              const hora = new Date(evento.EventDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <tr
                  key={evento.EventId}
                  onClick={() => handleVerEvento(evento.EventId)}
                >
                  <td className="events-td-fecha">
                    <div className="events-fecha">{fecha}</div>
                    <div className="events-hora">{hora}</div>
                  </td>
                  <td className="events-td-evento">
                    {evento.EventName}
                  </td>
                  <td className="events-td-cliente">
                    {evento.ClientName || "Desconocido"}
                  </td>
                  <td>
                    <EstadoBadge estado={translateStatus(evento.EventStatus)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="pagination-arrow"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
          </svg>
        </button>

        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className="pagination-arrow"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </button>
      </div>

      {/* Empty State */}
      {eventosFiltrados.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron eventos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default ListEventsA;