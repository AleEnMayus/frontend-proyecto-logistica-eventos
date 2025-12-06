import React from "react";
import "../../Views/CSS/modals.css";
import "../../Views/CSS/components.css";

const TermsModal = ({ onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose}></div>

      {/* Contenedor del modal */}
      <div className="profile-modal w-800">

        {/* Botón cerrar */}
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        {/* Título */}
        <h2 className="mb-3">Términos y Condiciones</h2>

        {/* Contenido Scrollable */}
        <div
          className="modal-description"
          style={{
            maxHeight: "350px",
            overflowY: "auto",
            padding: "15px",
            lineHeight: "1.5",
          }}
        >
          <p>
            Bienvenido a Happy-Art Events. Al crear una cuenta y utilizar
            nuestros servicios, aceptas los siguientes términos:
          </p>

          <p>
            1. Tus datos serán utilizados únicamente para la gestión de eventos,
            autenticación y mejoras de la plataforma.
          </p>

          <p>
            2. No está permitido realizar actividades fraudulentas, manipular
            información, o intentar afectar la funcionalidad del sistema.
          </p>

          <p>
            3. Eres responsable de mantener tus credenciales seguras y no
            compartir tu contraseña.
          </p>

          <p>
            4. Happy-Art Events se reserva el derecho de suspender cuentas que
            incumplan las normas o afecten a otros usuarios.
          </p>

          <p>
            5. Al registrar un evento o participar como cliente, autorizas el
            uso de la información necesaria para la gestión del proceso.
          </p>

          <p>
            Para más información, puedes contactarnos mediante los medios
            oficiales del sistema.
          </p>
        </div>

        {/* Footer */}
        <div className="pm-footer mt-4">
          <button className="btn-secondary-custom btn w-100" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};

export default TermsModal;
