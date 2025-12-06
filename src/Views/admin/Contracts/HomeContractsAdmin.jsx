import React, { useState } from "react";
import api from "../../../utils/axiosConfig";
import HeaderAdm from "../../../components/HeaderSidebar/HeaderAdm";
import "../../CSS/components.css";
import { useParams, useNavigate } from "react-router-dom";

const ContractsAdmin = () => {
  const { eventId } = useParams();
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //  Subir y enviar contrato 
  const handleSendContract = async () => {
    if (!contrato) return alert("Selecciona un contrato PDF antes de enviar.");

    try {
      setLoading(true);

      // Paso 1: verificar contrato existente
      try {
        const verifyResponse = await api.get(`/contracts/by-event/${eventId}`);
        const existing = verifyResponse.data;
        if (existing.ContractRoute) {
          alert("Este evento ya tiene un contrato asignado. No puedes reemplazarlo.");
          setLoading(false);
          return;
        }
      } catch (err) {
        // Si no existe es OK, continuamos
      }

      // Paso 2: subir contrato
      const formData = new FormData();
      formData.append("pdf", contrato);
      formData.append("eventId", eventId);

      const response = await api.post("/contracts/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`Contrato enviado correctamente a ${response.data.data.emailSentTo}\nCódigo: ${response.data.data.contractNumber}`);
      setContrato(null);

    } catch (error) {
      console.error("Error subiendo contrato:", error);
      alert(error.response?.data?.error || error.message || "Ocurrió un error al subir el contrato");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarContrato = () => setContrato(null);
  const handleVerListado = () => navigate("/ListContracts");

  return (
    <div className="contrato-container mle-0">
      <HeaderAdm />

      <div className="contrato-wrapper mt-11 d-flex flex-column justify-center">
        <div className="contrato-card  mx-auto">
          <h2 className="contrato-subtitle">Enviar Contrato</h2>

          {/* Zona de Drop & Upload */}
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) setContrato(file);
            }}
            onClick={() => document.getElementById("fileInput").click()}
          >
            {contrato ? (
              <p>
                <strong>Archivo seleccionado:</strong> {contrato.name}
              </p>
            ) : (
              <>
                <p>Arrastra y suelta un archivo aquí o haz clic para seleccionarlo</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentcolor"
                >
                  <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                </svg>
              </>
            )}
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              onChange={(e) => setContrato(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>

          {/* Botones internos */}
          <div className="contrato-actions">
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="btn-primary-custom btn"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
              </svg>
              Cargar Contrato
            </button>

            <button
              onClick={handleSendContract}
              className="btn-primary-custom btn"
              disabled={!contrato || loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
              </svg>
              {loading ? "Enviando..." : "Enviar Contrato"}
            </button>

            <button
              onClick={handleEliminarContrato}
              className="btn-secondary-custom btn w-100"
              disabled={!contrato || loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className='me-2' height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
              </svg>
              Eliminar contrato
            </button>
          </div>
        </div>

        <button
          onClick={handleVerListado}
          className="btn-secondary-custom btn mx-auto "
        >
          Ver Listado De Contratos
        </button>
      </div>
    </div>
  );
};

export default ContractsAdmin;