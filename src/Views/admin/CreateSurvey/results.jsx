import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/axiosConfig';
import HeaderAdm from '../../../components/HeaderSidebar/HeaderAdm';
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";
import '../../CSS/Lists.css';
import '../../CSS/components.css';

const QUESTIONS_PER_PAGE = 5;

const ResultsSurvey = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar resultados desde API
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get("/survey");
      const data = response.data;

      // Mapeamos para asegurarnos de que siempre haya texto y nombre de usuario
      const organized = data.map(item => ({
        user: item.UserName || "Usuario desconocido",
        event: item.EventName || "Evento desconocido",
        question: item.QuestionText || "Pregunta sin texto",
        value: Number(item.NumericValue) || 0
      }));


      // Ordenar por usuario -> evento -> pregunta
      organized.sort((a, b) => {
        if (a.user !== b.user) return a.user.localeCompare(b.user);
        if (a.event !== b.event) return a.event.localeCompare(b.event);
        return a.question.localeCompare(b.question);
      });

      setResults(organized);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || err.message || "Error al cargar resultados", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filtrar resultados (protección contra undefined)
  const filteredResults = results.filter(r =>
    (r.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.event || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.question || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLast = currentPage * QUESTIONS_PER_PAGE;
  const indexOfFirst = indexOfLast - QUESTIONS_PER_PAGE;
  const currentResults = filteredResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredResults.length / QUESTIONS_PER_PAGE);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleBack = () => navigate("/SurvayHome");
  // Agrupar los resultados de la página actual por nombre de evento
  const groupedCurrentResults = currentResults.reduce((acc, r) => {
    const key = (r.event || 'Desconocido').trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="list-container">
      <HeaderAdm />

      <div className="list-header mt-5 pt-5">
        <h2 className="list-title">RESULTADOS DE ENCUESTAS</h2>
      </div>

      {/* Buscador */}
      <div className="search-container mb-4 w-50-lg">
        <span className="search-label">Buscar</span>
        <input
          type="text"
          className="form-control search-input"
          placeholder="Buscar por usuario, evento o pregunta..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Tabla */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">Cargando resultados...</div>
        ) : (
          <>
            {Object.keys(groupedCurrentResults).length === 0 ? (
              <div className="empty-state">No se encontraron resultados.</div>
            ) : (
              Object.entries(groupedCurrentResults).map(([eventName, rows]) => (
                <div key={eventName} className="mb-4">
                  <h4 style={{ margin: '8px 0', color: '#222' }}>
                    <strong>Nombre del evento:</strong>&nbsp;{eventName}
                  </h4>
                  <table className="table list-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Pregunta</th>
                        <th>Valor</th>
                        <th>Barra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={`${eventName}-${idx}`}>
                          <td>{r.user}</td>
                          <td>{r.question}</td>
                          <td>{r.value} ⭐</td>
                          <td>
                            <div className="result-bar-container">
                              <div
                                className="result-bar"
                                style={{
                                  width: `${Math.min(r.value * 20, 100)}%`,
                                  backgroundColor:
                                    r.value >= 4 ? "#10b981" : r.value >= 3 ? "#facc15" : "#ef4444",
                                  height: '16px',
                                  borderRadius: '4px'
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button
          className="pagination-arrow"
          onClick={() => goToPage(currentPage - 1)}
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
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className="pagination-arrow"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </button>
      </div>

      {/* Botón volver */}
      <div className="form-actions mt-3">
        <button type="button" className="btn-cancel" onClick={handleBack}>
          ← Volver
        </button>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ResultsSurvey;