import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import "../CSS/CalendarAdmin.css";
import HeaderAdm from "../../components/HeaderSidebar/HeaderAdm";
import {translateStatus} from "../../utils/FormatText";

const CalendarAdmin = () => {
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
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}`;

      const response = await api.get(`/calendar/admin?startDate=${startDate}&endDate=${endDate}`);
      const data = response.data;

      const eventosPorFecha = {};
      const citasPorFecha = {};

      data.forEach(item => {
        const fecha = new Date(item.start).toISOString().split("T")[0];

        if (item.type === "event") {
          if (!eventosPorFecha[fecha]) eventosPorFecha[fecha] = [];
          eventosPorFecha[fecha].push({
            EventName: item.title,
            EventDateTime: item.start,
            EventStatus: item.status,
            ClientName: item.userEmail,
            EventDescription: item.description,
            Address: item.location,
            Capacity: item.capacity
          });
        } else if (item.type === "appointment") {
          if (!citasPorFecha[fecha]) citasPorFecha[fecha] = [];
          citasPorFecha[fecha].push({
            AppointmentName: item.title,
            AppointmentDateTime: item.start,
            AppointmentStatus: item.status,
            Description: item.description,
            UserEmail: item.userEmail,
            UserPhone: item.userPhone
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

    for (let i = startDay - 1; i >= 0; i--) {
      calendarCells.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          <span className="day-number">{prevMonthDays - i}</span>
        </div>
      );
    }

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
                  {(item.EventName || item.Description || "Sin título").substring(0, 15)}
                  {(item.EventName || item.Description || "").length > 15 ? "..." : ""}
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

  const formatTime = (dateTime) => new Date(dateTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const getStatusColor = (status) => {
    const colors = {
      completed: "#28a745",
      in_planning: "#ffc107",
      in_execution: "#007bff",
      canceled: "#dc3545",
      cancelled: "#dc3545",
      approved: "#17a2b8"
    };
    return colors[status?.toLowerCase()] || "#6c757d";
  };

  return (
    <div className="mx-auto calendar-admin-container">
      <HeaderAdm />
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
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor"><path d="M582-298 440-440v-200h80v167l118 118-56 57ZM440-720v-80h80v80h-80Zm280 280v-80h80v80h-80ZM440-160v-80h80v80h-80ZM160-440v-80h80v80h-80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                {formatTime(ev.EventDateTime)}
                              </p>
                              <p className="event-location">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg> 
                                {ev.Address || 'Sin ubicación'}
                              </p>
                              <p className="event-location">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                                {ev.ClientName || 'Sin cliente'}
                              </p>
                              <p className="event-status-calendar">
                                <span 
                                  className="status-badge"
                                  style={{ backgroundColor: getStatusColor(ev.EventStatus) }}
                                >
                                  {translateStatus(ev.EventStatus)}
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
                        <h4 className="section-title-calendar">Citas</h4>
                        {currentDayEvents.citas.map((cita, idx) => (
                          <div key={idx} className="event-item">
                            <div className="event-indicator blue"></div>
                            <div className="event-content">
                              <p className="event-name">{cita.Description || 'Sin descripción'}</p>
                              <p className="event-time">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor"><path d="M582-298 440-440v-200h80v167l118 118-56 57ZM440-720v-80h80v80h-80Zm280 280v-80h80v80h-80ZM440-160v-80h80v80h-80ZM160-440v-80h80v80h-80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                {formatTime(cita.AppointmentDateTime)}
                              </p>
                              <p className="event-contact">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                                {cita.UserEmail || cita.UserPhone || 'Sin contacto'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sin eventos */}
                    {currentDayEvents.eventos.length === 0 && currentDayEvents.citas.length === 0 && (
                      <div className="no-events d-flex flex-column align-items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor" style={{ opacity: 0.3 }}>
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
                      </svg>
                        <p>No hay eventos para este día</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-events d-flex flex-column align-items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor" style={{ opacity: 0.3 }}>
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
                      </svg>
                    <p>Selecciona un día para ver los eventos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarAdmin;