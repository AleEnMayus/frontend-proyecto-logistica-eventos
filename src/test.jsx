import React, { useState, useEffect, useRef } from "react";
import api from "./utils/axiosConfig";
import HeaderCl from "./components/HeaderSidebar/HeaderCl";
import { useToast } from "./hooks/useToast";
import ToastContainer from "./components/ToastContainer";
import './views/CSS/components.css';
import './views/CSS/FormsUser.css';
import './views/CSS/Calendar.css';

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEK_DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const YEAR_RANGE = { start: 2020, end: 2030 };

const STATUS_COLORS = {
  completed: '#28a745',
  in_planning: '#ffc107',
  in_execution: '#007bff',
  cancelled: '#dc3545',
  default: '#6c757d'
};

const TestC = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventos, setEventos] = useState({});
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  
  const { toasts, addToast, removeToast } = useToast();
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthRef.current && !monthRef.current.contains(event.target)) {
        setShowMonthSelector(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target)) {
        setShowYearSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCitasUsuario();
  }, []);

  const fetchCitasUsuario = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userString = localStorage.getItem("user");

      if (!userString) {
        console.warn("No hay información de usuario en localStorage");
        return;
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      const response = await api.get("/requests", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = response.data;
      const citasAprobadas = filterApprovedAppointments(data, userId);
      const eventosPorFecha = groupAppointmentsByDate(citasAprobadas);

      setEventos(eventosPorFecha);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      addToast("Error al cargar las citas aprobadas", "error");
    }
  };

  const filterApprovedAppointments = (requests, userId) => {
    return requests.filter(
      (req) =>
        req.UserId == userId &&
        req.RequestType === "schedule_appointment" &&
        req.RequestStatus === "approved"
    );
  };

  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};
    
    appointments.forEach((cita) => {
      const fecha = new Date(cita.RequestDate).toISOString().split("T")[0];
      
      if (!grouped[fecha]) {
        grouped[fecha] = [];
      }

      grouped[fecha].push({
        EventName: cita.RequestDescription || "Cita aprobada",
        EventDateTime: cita.RequestDate,
        EventStatus: cita.RequestStatus,
        ClientName: "Tú",
        EventDescription: cita.RequestDescription,
        CitationDetails: "Cita confirmada",
      });
    });

    return grouped;
  };

  const generateYears = () => {
    const years = [];
    for (let i = YEAR_RANGE.start; i <= YEAR_RANGE.end; i++) {
      years.push(i);
    }
    return years;
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDay = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const formatDate = (year, month, day) => {
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month + 1 < 10 ? `0${month + 1}` : month + 1;
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const isToday = (year, month, day) => {
    const date = new Date(year, month, day);
    return new Date().toDateString() === date.toDateString();
  };

  const getColorByStatus = (status) => {
    return STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.default;
  };

  const handleDayClick = (day) => {
    const formattedDate = formatDate(selectedYear, selectedMonth, day);
    setSelectedDate(formattedDate);
  };

  const changeMonth = (increment) => {
    let nuevoMes = selectedMonth + increment;
    let nuevoAño = selectedYear;
    
    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAño++;
    } else if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAño--;
    }
    
    setSelectedMonth(nuevoMes);
    setSelectedYear(nuevoAño);
    setSelectedDate(null);
  };

  const selectMonth = (mes) => {
    setSelectedMonth(mes);
    setShowMonthSelector(false);
    setSelectedDate(null);
  };

  const selectYear = (año) => {
    setSelectedYear(año);
    setShowYearSelector(false);
    setSelectedDate(null);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const startDay = getStartDay(selectedYear, selectedMonth);
    const calendarCells = [];

    for (let i = 0; i < startDay; i++) {
      calendarCells.push(
        <div key={`empty-${i}`} className="day empty"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = formatDate(selectedYear, selectedMonth, day);
      const isSelected = selectedDate === formattedDate;
      const eventosDelDia = eventos[formattedDate] || [];
      const hasEvents = eventosDelDia.length > 0;
      const esHoy = isToday(selectedYear, selectedMonth, day);

      calendarCells.push(
        <div
          key={formattedDate}
          className={`day ${esHoy ? 'today' : ''} ${isSelected ? "selected" : ""} ${hasEvents ? "event-day" : ""}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasEvents && <span className="event-indicator">•</span>}
        </div>
      );
    }

    return calendarCells;
  };

  const renderEventDetails = () => {
    return (
      <div className="no-selection">
        <div className="detail-item"><strong>Evento:</strong><span>-</span></div>
        <div className="detail-item"><strong>Hora:</strong><span>-</span></div>
        <div className="detail-item"><strong>Cliente:</strong><span>-</span></div>
        <div className="detail-item"><strong>Estado:</strong><span>-</span></div>
      </div>
    );
  };

  const renderAppointmentDetails = () => {
    if (!selectedDate) {
      return (
        <div className="no-selection">
          <p>Selecciona un día</p>
          <div className="detail-item"><strong>Descripción:</strong><span>-</span></div>
          <div className="detail-item"><strong>Hora:</strong><span>-</span></div>
          <div className="detail-item"><strong>Cliente:</strong><span>-</span></div>
          <div className="detail-item"><strong>Fecha:</strong><span>-</span></div>
          <div className="detail-item"><strong>Citación:</strong><span>-</span></div>
        </div>
      );
    }

    const eventosDelDia = eventos[selectedDate];
    
    if (!eventosDelDia || eventosDelDia.length === 0) {
      return (
        <div className="no-selection">
          <p>No hay citas registradas para esta fecha.</p>
        </div>
      );
    }

    return eventosDelDia.map((ev, idx) => (
      <div key={idx} className="event-item">
        <div className="detail-item">
          <strong>Descripción:</strong>
          <span>{ev.EventDescription || "Sin descripción"}</span>
        </div>
        <div className="detail-item">
          <strong>Hora:</strong>
          <span>{new Date(ev.EventDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="detail-item">
          <strong>Cliente:</strong>
          <span>{ev.ClientName || "Desconocido"}</span>
        </div>
        <div className="detail-item">
          <strong>Fecha:</strong>
          <span>{selectedDate.split("-")[2]} de {MONTHS[selectedMonth]} de {selectedYear}</span>
        </div>
        <div className="detail-item">
          <strong>Citación:</strong>
          <span>{ev.CitationDetails || "Por definir"}</span>
        </div>
        {idx < eventosDelDia.length - 1 && (
          <hr style={{ margin: '10px 0', border: '1px solid var(--color-light)' }} />
        )}
      </div>
    ));
  };

  const MonthSelector = () => (
    <div ref={monthRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => {
          setShowMonthSelector(!showMonthSelector);
          setShowYearSelector(false);
        }}
        style={{
          background: 'var(--color-light)',
          border: '2px solid var(--color-gray)',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          minWidth: '140px',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--color-accent)';
          e.target.style.color = 'var(--color-white)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--color-light)';
          e.target.style.color = 'var(--color-dark)';
        }}
      >
        <span>{MONTHS[selectedMonth]}</span>
        <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>▼</span>
      </button>
      
      {showMonthSelector && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'var(--color-white)',
          border: '2px solid var(--color-primary)',
          borderRadius: '8px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          width: '140px',
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '5px'
        }}>
          {MONTHS.map((mes, index) => (
            <div
              key={mes}
              onClick={() => selectMonth(index)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--color-light)',
                background: selectedMonth === index 
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' 
                  : 'transparent',
                color: selectedMonth === index ? 'var(--color-white)' : 'var(--color-dark)',
                transition: 'all 0.2s ease',
                fontWeight: selectedMonth === index ? 'bold' : 'normal',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (selectedMonth !== index) {
                  e.target.style.background = 'var(--color-accent)';
                  e.target.style.color = 'var(--color-white)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMonth !== index) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--color-dark)';
                }
              }}
            >
              {mes}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const YearSelector = () => (
    <div ref={yearRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => {
          setShowYearSelector(!showYearSelector);
          setShowMonthSelector(false);
        }}
        style={{
          background: 'var(--color-light)',
          border: '2px solid var(--color-gray)',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          minWidth: '100px',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--color-accent)';
          e.target.style.color = 'var(--color-white)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--color-light)';
          e.target.style.color = 'var(--color-dark)';
        }}
      >
        <span>{selectedYear}</span>
        <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>▼</span>
      </button>
      
      {showYearSelector && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: 'var(--color-white)',
          border: '2px solid var(--color-secondary)',
          borderRadius: '8px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          width: '100px',
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '5px'
        }}>
          {generateYears().map(año => (
            <div
              key={año}
              onClick={() => selectYear(año)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--color-light)',
                background: selectedYear === año 
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' 
                  : 'transparent',
                color: selectedYear === año ? 'var(--color-white)' : 'var(--color-dark)',
                transition: 'all 0.2s ease',
                fontWeight: selectedYear === año ? 'bold' : 'normal',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (selectedYear !== año) {
                  e.target.style.background = 'var(--color-accent)';
                  e.target.style.color = 'var(--color-white)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedYear !== año) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--color-dark)';
                }
              }}
            >
              {año}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <HeaderCl />
      <div className="calendar-container" style={{ marginTop: "80px" }}>
        <h2 className="calendar-title">CALENDARIO</h2>

        <div className="calendar-content">
          <div className="calendar-box">
            <div className="calendar-header">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                flexWrap: 'wrap', 
                justifyContent: 'center' 
              }}>
                <button 
                  className="calendar-arrow" 
                  onClick={() => changeMonth(-1)}
                  title="Mes anterior"
                >
                  ‹
                </button>
                
                <MonthSelector />
                <YearSelector />

                <button 
                  className="calendar-arrow" 
                  onClick={() => changeMonth(1)}
                  title="Mes siguiente"
                >
                  ›
                </button>

                <button 
                  onClick={goToCurrentMonth}
                  style={{
                    background: 'var(--color-success)',
                    color: 'var(--color-white)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    marginLeft: '10px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--color-secondary)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'var(--color-success)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Hoy
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {WEEK_DAYS.map((dayName, index) => (
                <div key={index} className="day-name">
                  {dayName}
                </div>
              ))}
              {renderCalendarDays()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexDirection: 'row' }}>
            <div className="event-box" style={{ width: '280px' }}>
              <div className="event-header">
                <h4>Detalles del Evento</h4>
              </div>
              <div className="event-details">
                {renderEventDetails()}
              </div>
            </div>

            <div className="event-box" style={{ width: '280px' }}>
              <div className="event-header">
                <h4>Detalles de Cita</h4>
              </div>
              <div className="event-details">
                {renderAppointmentDetails()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default TestC;