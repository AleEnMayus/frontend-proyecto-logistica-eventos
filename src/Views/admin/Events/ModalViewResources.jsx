import React, { useMemo, useState, useEffect } from "react";
import "../../../Views/CSS/Modals.css";
import "../../../Views/CSS/components.css";

const ModalViewResources = ({ resources = [], onClose }) => {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const recursosPorPagina = 4;

  // Filtrado
  const recursosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) =>
        r.ResourceName.toLowerCase().includes(q) ||
        String(r.AssignedQuantity).includes(q) ||
        String(r.Prices).includes(q) 
    );
  }, [busqueda, resources]);

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(recursosFiltrados.length / recursosPorPagina)
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [totalPaginas, paginaActual]);

  const indexPrimero = (paginaActual - 1) * recursosPorPagina;
  const recursosActuales = recursosFiltrados.slice(
    indexPrimero,
    indexPrimero + recursosPorPagina
  );

  // Botones de páginas (ventana de 5)
  const getPagesWindow = () => {
    const maxButtons = 5;
    if (totalPaginas <= maxButtons)
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);

    let start = Math.max(1, paginaActual - 2);
    let end = start + (maxButtons - 1);
    if (end > totalPaginas) {
      end = totalPaginas;
      start = end - (maxButtons - 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal w-800">
        
        {/* Botón cierre */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Título */}
        <h2 className="modal-title">Recursos Asignados</h2>

        {/* Buscador */}
        <div className="search-container">
          <label className="search-label">Buscar recurso</label>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, cantidad, precio o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de recursos */}
        <div className="table-container">
          <table className="list-table">
            <thead>
              <tr>
                <th>Nombre recurso</th>
                <th>Cantidad asignada</th>
                <th>Precio</th>
              </tr>
            </thead>

            <tbody>
              {recursosActuales.length > 0 ? (
                recursosActuales.map((r, index) => (
                  <tr key={index}>
                    <td>{r.ResourceName}</td>
                    <td>{r.AssignedQuantity}</td>
                    <td>${r.Prices}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No se encontraron recursos asignados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          <button
            className="pagination-arrow"
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            ‹
          </button>

          <div className="pagination-numbers">
            {getPagesWindow().map((n) => (
              <button
                key={n}
                className={`pagination-btn ${
                  paginaActual === n ? "active" : ""
                }`}
                onClick={() => setPaginaActual(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="pagination-arrow"
            onClick={() =>
              setPaginaActual((p) => Math.min(totalPaginas, p + 1))
            }
            disabled={paginaActual === totalPaginas}
          >
            ›
          </button>
        </div>

        {/* Footer */}
        <div className="pm-footer">
          <button className="btn-custom btn-secondary-custom btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalViewResources;
