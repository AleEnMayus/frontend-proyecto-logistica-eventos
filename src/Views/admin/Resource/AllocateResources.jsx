import React, { useMemo, useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import { eraseUnderscore } from "../../../utils/FormatText";
import "../../CSS/components.css";
import "../../CSS/Lists.css";
import "../../CSS/Modals.css";

const AssignResourcesModal = ({ onClose, onSave, preselected = [] }) => {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [seleccion, setSeleccion] = useState(new Map());
  const [recursos, setRecursos] = useState([]);
  const recursosPorPagina = 4;

  // Cargar recursos
  const fetchRecursos = async () => {
    try {
      const response = await api.get("/resources");
      const data = response.data;

      // Inicializar seleccion con preselected
      const preMap = new Map();
      preselected.forEach((r) => {
        preMap.set(r.resourceId, {
          quantity: r.quantity || 1,
          status: r.status || "assigned",
          price: r.price || 0,
          max: r.max || null,
        });
      });

      setSeleccion(preMap);
      setRecursos(data);
    } catch (error) {
      console.error("Error cargando recursos:", error);
    }
  };

  useEffect(() => {
    fetchRecursos();
  }, []);

  // Filtrado
  const recursosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return recursos;
    return recursos.filter(
      (r) =>
        r.ResourceName.toLowerCase().includes(q) ||
        String(r.ResourceId).includes(q) ||
        r.Status.toLowerCase().includes(q)
    );
  }, [busqueda, recursos]);

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

  // Selección
  const toggleSeleccion = (r) => {
    setSeleccion((prev) => {
      const next = new Map(prev);
      if (next.has(r.ResourceId)) {
        next.delete(r.ResourceId);
      } else {
        next.set(r.ResourceId, {
          quantity: 1,
          status: "assigned",
          price: r.Price || 0,
          max: r.Quantity, // guardar la cantidad máxima
        });
      }
      return next;
    });
  };

  const updateQuantity = (id, value, max) => {
    setSeleccion((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        let cantidad = Math.max(1, Number(value) || 1);
        if (max && cantidad > max) cantidad = max; // no superar máximo
        next.set(id, {
          ...next.get(id),
          quantity: cantidad,
        });
      }
      return next;
    });
  };

  // Botones de páginas
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
    <div className="profile-modal w-800 ">
      {/* Botón de cierre */}
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>

      <h2 className="modal-title">Asignar Recursos</h2>

      {/* Buscador */}
      <div className="search-container">
        <label className="search-label">Buscar recurso</label>
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, código o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="list-table">
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>Nombre</th>
              <th>ID</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {recursosActuales.length > 0 ? (
              recursosActuales.map((r) => {
                const selected = seleccion.get(r.ResourceId);
                const isDisabled = r.Status === "In_use";

                return (
                  <tr key={r.ResourceId} className={isDisabled ? "disabled-row" : ""}>
                    <td>
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={!!selected}
                          onChange={() => toggleSeleccion(r)}
                          disabled={isDisabled}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </td>
                    <td>{r.ResourceName}</td>
                    <td>{r.ResourceId}</td>
                    <td>
                      {selected ? (
                        <div className="quantity-wrapper">
                          <input
                            type="number"
                            min="1"
                            max={r.Quantity}
                            className="field-value"
                            value={selected.quantity}
                            onChange={(e) =>
                              updateQuantity(r.ResourceId, e.target.value, r.Quantity)
                            }
                            disabled={isDisabled}
                          />
                          <small className="text-muted">máx: {r.Quantity}</small>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {eraseUnderscore(r.Status)} <br />
                      <small className="text-muted">{r.StatusDescription}</small>
                    </td>
                    <td>${r.Price}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No se encontraron recursos.
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
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
          </svg>
        </button>
        <div className="pagination-numbers">
          {getPagesWindow().map((n) => (
            <button
              key={n}
              className={`pagination-btn ${paginaActual === n ? "active" : ""}`}
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
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentcolor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="pm-footer">
        <button className="btn-custom btn-status-custom" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn-custom btn-edit-custom"
          onClick={() =>
            onSave?.(
              Array.from(seleccion, ([resourceId, { quantity, status, price }]) => ({
                resourceId,
                quantity,
                status,
                price,
              }))
            )
          }
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default AssignResourcesModal;