import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import "../CSS/CalendarAdmin.css";
import HeaderCl from "../../components/HeaderSidebar/HeaderCl";
import {translateRequestType} from "../../utils/FormatText";

const CalendarClient = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventos, setEventos] = useState({});
  const [citas, setCitas] = useState({});
  const [currentDayEvents, setCurrentDayEvents] = useState({ eventos: [], citas: [] });

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    fetchCalendarData();
  }, [selectedYear, selectedMonth]);

  const fetchCalendarData = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        console.error("No hay usuario en localStorage");
        return;
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}`;

      // Obtener todos los datos (eventos y citas)
      const res = await api.get(
        `/calendar/user/${userId}?startDate=${startDate}&endDate=${endDate}`
      );

      const data = res.data;

      // Separar eventos y citas
      const eventosPorFecha = {};
      const citasPorFecha = {};

      data.forEach(item => {
        const fecha = item.start ? item.start.split("T")[0] : null;
        if (!fecha) return;

        if (item.type === "event") {
          if (!eventosPorFecha[fecha]) eventosPorFecha[fecha] = [];
          eventosPorFecha[fecha].push({
            EventName: item.title || "Sin título",
            EventDateTime: item.start,
            EventStatus: item.status,
            EventDescription: item.description,
            Address: item.location,
            Capacity: item.capacity
          });
        } else if (item.type === "appointment") {
          if (!citasPorFecha[fecha]) citasPorFecha[fecha] = [];
          citasPorFecha[fecha].push({
            title: item.title || "Sin título",
            start: item.start,
            status: item.status || "pending",
            description: item.description || "Sin descripción",
            requestType: item.requestType || "Por definir",
            userEmail: item.userEmail || "",
            userPhone: item.userPhone || ""
          });
        }
      });

      setEventos(eventosPorFecha);
      setCitas(citasPorFecha);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getStartDay = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handleDayClick = (day) => {
    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(selectedMonth + 1).padStart(2, "0");
    const formattedDate = `${selectedYear}-${formattedMonth}-${formattedDay}`;

    setSelectedDate(formattedDate);
    setCurrentDayEvents({
      eventos: eventos[formattedDate] || [],
      citas: citas[formattedDate] || []
    });
  };

  const changeMonth = (increment) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setSelectedDate(null);
  };

  const goToToday = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const startDay = getStartDay(selectedYear, selectedMonth);
    const calendarCells = [];
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();

    // Días del mes anterior
    for (let i = startDay - 1; i >= 0; i--) {
      calendarCells.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          <span className="day-number">{prevMonthDays - i}</span>
        </div>
      );
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, "0");
      const formattedMonth = String(selectedMonth + 1).padStart(2, "0");
      const formattedDate = `${selectedYear}-${formattedMonth}-${formattedDay}`;

      const isSelected = selectedDate === formattedDate;
      const eventosDelDia = eventos[formattedDate] || [];
      const citasDelDia = citas[formattedDate] || [];
      const esHoy = new Date().toDateString() === new Date(selectedYear, selectedMonth, day).toDateString();

      const todosEventos = [...eventosDelDia, ...citasDelDia];

      calendarCells.push(
        <div
          key={formattedDate}
          className={`calendar-day ${esHoy ? "today" : ""} ${isSelected ? "selected" : ""}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>

          {todosEventos.length > 0 && (
            <div className="event-indicators">
              {todosEventos.slice(0, 2).map((item, idx) => (
                <div key={idx} className={`event-badge ${item.EventName ? "event" : "appointment"}`}>
                  {(item.EventName || item.title || item.description || "Sin título").substring(0, 15)}
                  {(item.EventName || item.title || item.description || "").length > 15 ? "..." : ""}
                </div>
              ))}
              {todosEventos.length > 2 && (
                <div className="event-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Días del siguiente mes
    const totalCells = calendarCells.length;
    const remainingCells = 35 - totalCells;

    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push(
        <div key={`next-${i}`} className="calendar-day other-month">
          <span className="day-number">{i}</span>
        </div>
      );
    }

    return calendarCells;
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("es-ES", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "#28a745",
      in_planning: "#ffc107",
      in_execution: "#007bff",
      canceled: "#dc3545",
      cancelled: "#dc3545",
      approved: "#17a2b8",
      pending: "#ffc107",
      rejected: "#dc3545"
    };
    return colors[status?.toLowerCase()] || "#6c757d";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      completed: "Completado",
      in_planning: "En Planificación",
      in_execution: "En Ejecución",
      canceled: "Cancelado",
      cancelled: "Cancelado",
      approved: "Aprobada",
      pending: "Pendiente",
      rejected: "Rechazada"
    };
    return statusTexts[status?.toLowerCase()] || status;
  };

  return (
    <div className="mx-auto calendar-admin-container">
      <HeaderCl />
      <div className="row g-4">

        {/* Calendario Principal */}
        <div className="col-lg-8">
          <div className="calendar-card">

            <div className="calendar-header">
              <div className="selectors">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="month-selector p-3 me-2 btn-today"
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="year-selector p-3 btn-today"
                >
                  {Array.from({ length: 11 }, (_, i) => 2025 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="calendar-controls">
                <button className="btn-control" onClick={() => changeMonth(-1)} title="Mes anterior">
                  ‹
                </button>
                <button className="btn-today" onClick={goToToday}>
                  Hoy
                </button>
                <button className="btn-control" onClick={() => changeMonth(1)} title="Mes siguiente">
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-grid-container">
              <div className="weekdays-grid">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, idx) => (
                  <div key={idx} className="weekday-name">{day}</div>
                ))}
              </div>
              <div className="calendar-grid">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Detalles */}
        <div className="col-lg-4">
          <div className="details-panel">
            <h3 className="details-title">
              {selectedDate ? (
                <>
                  {months[selectedMonth]} {selectedDate.split("-")[2]}, {selectedYear}
                </>
              ) : (
                "Selecciona un día"
              )}
            </h3>
            
            {selectedDate && (
              <p className="details-count">
                {currentDayEvents.eventos.length + currentDayEvents.citas.length} evento(s) programado(s)
              </p>
            )}

            <hr className="divider" />

            <div className="events-list">
              {selectedDate ? (
                <>
                  {/* Eventos */}
                  {currentDayEvents.eventos.length > 0 && (
                    <div className="event-section">
                      <h4 className="section-title-calendar">Eventos</h4>
                      {currentDayEvents.eventos.map((ev, idx) => (
                        <div key={idx} className="event-item">
                          <div className="event-indicator purple"></div>
                          <div className="event-content">
                            <p className="event-name">{ev.EventName}</p>
                            <p className="event-time">
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                <path d="M582-298 440-440v-200h80v167l118 118-56 57ZM440-720v-80h80v80h-80Zm280 280v-80h80v80h-80ZM440-160v-80h80v80h-80ZM160-440v-80h80v80h-80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                              </svg>
                              {formatTime(ev.EventDateTime)}
                            </p>
                            <p className="event-location">
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                              </svg>
                              {ev.Address || 'Sin ubicación'}
                            </p>
                            {ev.EventDescription && (
                              <p className="event-description" style={{ 
                                fontSize: '0.875rem', 
                                color: 'var(--color-gray)', 
                                margin: '0.25rem 0',
                                fontStyle: 'italic'
                              }}>
                                {ev.EventDescription}
                              </p>
                            )}
                            <p className="event-status-calendar">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(ev.EventStatus) }}
                              >
                                {getStatusText(ev.EventStatus)}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Citas */}
                  {currentDayEvents.citas.length > 0 && (
                    <div className="event-section">
                      <h4 className="section-title-calendar">Mis Citas</h4>
                      {currentDayEvents.citas.map((cita, idx) => (
                        <div key={idx} className="event-item">
                          <div className="event-indicator blue"></div>
                          <div className="event-content">
                            <p className="event-name">
                              {cita.title || cita.description || 'Sin título'}
                            </p>
                            <p className="event-time">
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                <path d="M582-298 440-440v-200h80v167l118 118-56 57ZM440-720v-80h80v80h-80Zm280 280v-80h80v80h-80ZM440-160v-80h80v80h-80ZM160-440v-80h80v80h-80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                              </svg>
                              {formatTime(cita.start)}
                            </p>
                            <p className="event-location">
                              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
                              </svg>
                              {translateRequestType(cita.requestType) || 'Tipo no especificado'}
                            </p>
                            {cita.description && cita.description !== cita.title && (
                              <p className="event-description" style={{ 
                                fontSize: '0.875rem', 
                                color: 'var(--color-gray)', 
                                margin: '0.25rem 0',
                                fontStyle: 'italic'
                              }}>
                                {cita.description}
                              </p>
                            )}
                            <p className="event-status-calendar">
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(cita.status) }}
                              >
                                {getStatusText(cita.status)}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sin eventos ni citas */}
                  {currentDayEvents.eventos.length === 0 && currentDayEvents.citas.length === 0 && (
                    <div className="no-events d-flex flex-column align-items-center gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor" style={{ opacity: 0.3 }}>
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
                      </svg>
                      <p>No hay eventos ni citas para este día</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-events d-flex flex-column align-items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor" style={{ opacity: 0.3 }}>
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
                      </svg>
                  <p>Selecciona un día para ver tus eventos y citas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarClient;