import React, { useState } from 'react';
import '../CSS/components.css';

const ScheduleAppointments = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Cita agendada para ${name} el ${date} a las ${time} para ${service}`);
  };

  const handleGoBackBrowser = () => {
    window.history.back();
  };

  return (
    <div className="login-container">
      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container">
          <div className="row align-items-center py-3">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <button onClick={handleGoBackBrowser} className="back-btn me-4" title="Volver">
                  ←
                </button>
                <div className="logo-text">Happy-Art Eventos</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="login-content mt-4">
        <div className="login-form-card">
          <h1 className="login-title">Agendar Cita</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Nombre completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label>Fecha</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label>Hora</label>
              <input
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label>Servicio</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Decoración, fotografía..."
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary-custom btn w-100">
              Confirmar Cita
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointments;
