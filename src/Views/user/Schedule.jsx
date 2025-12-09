import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import HeaderCl from "../../components/HeaderSidebar/HeaderCl";

//  Importamos tu hook y el contenedor
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";

import "../CSS/components.css";
import "../CSS/FormsUser.css";

const Schedule = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  //  Hook para toasts
  const { toasts, addToast, removeToast } = useToast();

  // Validar fecha
  const validateDate = (selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(selectedDate);

    if (inputDate < today) {
      addToast("No puedes seleccionar una fecha anterior a hoy", "danger");
      return false;
    }

    const year = inputDate.getFullYear();
    if (year < 1900 || year > 2100) {
      addToast("Por favor selecciona una fecha válida", "danger");
      return false;
    }
    return true;
  };

  // Validar hora
  const validateTime = (selectedTime) => {
    const [h, m] = selectedTime.split(":").map(Number);
    const decimalTime = h + m / 60;
    const inMorning = decimalTime >= 8 && decimalTime <= 10;
    const inAfternoon = decimalTime >= 13 && decimalTime <= 15;

    if (!inMorning && !inAfternoon) {
      addToast("Solo puedes agendar citas de 8:00 a 10:00 AM o de 1:00 a 3:00 PM", "danger");
      return false;
    }
    return true;
  };

  const sendRequest = async (e) => {
    e.preventDefault();

    if (!validateDate(date) || !validateTime(time)) return;

    try {
      // Combinar fecha y hora en formato ISO
      const managementDateTime = `${date}T${time}:00`;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await api.post("/requests", {
        // ManagementDate es la fecha DESEADA de la cita (obligatorio)
        ManagementDate: new Date().toISOString(),
        RequestDate: managementDateTime,
        RequestDescription: reason,
        RequestType: "schedule_appointment",
        UserId: user.id || 1,
        EventId: null
      });

      const data = response.data;
      addToast("Tu cita ha sido enviada correctamente", "success");
      setDate("");
      setTime("");
      setReason("");
      setTimeout(() => navigate("/EventsHome"), 2000);
      
    } catch (err) {
      console.error("Error al crear solicitud:", err);
      
      // Capturar el error del trigger de validación
      const errorMessage = err.response?.data?.error || "Hubo un problema al enviar la solicitud";
      const errorType = err.response?.data?.type;
      
      // Si es un error de validación (conflicto de horarios)
      if (errorType === 'validation_error') {
        addToast(errorMessage, "danger");
        
        // Opcional: mostrar sugerencia adicional
        if (err.response?.data?.suggestion) {
          setTimeout(() => {
            addToast(err.response.data.suggestion, "warning");
          }, 500);
        }
      } else {
        addToast(errorMessage, "danger");
      }
    }
  };

  const cancel = () => navigate("/EventsHome");

  return (
    <div>
      <HeaderCl />
      <div className="login-container">
        <div className="login-content">
          <div className="form-container-custom">
            <h2 className="login-title">AGENDAR CITA</h2>
            <p className="login-subtitle">Selecciona fecha, hora y motivo de tu cita</p>

            <form onSubmit={sendRequest}>
              <div className="form-group">
                <label htmlFor="date" className="form-label">Fecha de la cita</label>
                <input
                  type="date"
                  id="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time" className="form-label">
                  Hora de la cita <br />
                  <small>(Disponible: 8:00–10:00 AM y 1:00–3:00 PM)</small>
                </label>
                <input
                  type="time"
                  id="time"
                  className="form-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason" className="form-label">Motivo</label>
                <textarea
                  id="reason"
                  className="form-input"
                  style={{ minHeight: "100px", resize: "none" }}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Escriba el motivo de la cita"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel btn" onClick={cancel}>Cancelar</button>
                <button type="submit" className="btn-primary-custom btn">Enviar solicitud</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Contenedor de toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Schedule;