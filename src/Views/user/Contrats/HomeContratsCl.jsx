import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import HeaderCl from "../../../components/HeaderSidebar/HeaderCl";
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";
import '../../CSS/components.css';

const ContractsClient = () => {
  const [contratos, setContratos] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [uploadContractId, setUploadContractId] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const user = localStorage.getItem('user')
  const id = user ? JSON.parse(user).id : null;
  const clientId = id;

  // === FETCH TODOS LOS EVENTOS DEL CLIENTE ===
  const fetchContratos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contracts/by-client/${clientId}`);
      const data = response.data;
      setContratos(data);
      
      if (data.length === 0) {
        addToast('No tienes eventos registrados', 'info');
      }
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      addToast(error.response?.data?.error || 'Error al cargar los eventos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchContratos();
    } else {
      addToast('No se pudo identificar el usuario', 'danger');
    }
  }, [clientId]);

  // === CARGAR ARCHIVO PDF ===
  const handleCargarContrato = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        addToast('Solo se permiten archivos PDF', 'warning');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast('El archivo no puede superar los 10MB', 'warning');
        return;
      }
      setPdfFile(file);
      addToast('Archivo cargado correctamente', 'success');
    }
  };

  // === SUBIR O REEMPLAZAR CONTRATO ===
  const handleEnviarContrato = async () => {
    if (!uploadContractId) {
      addToast('Por favor, selecciona un evento', 'warning');
      return;
    }
    if (!pdfFile) {
      addToast('Por favor, carga un archivo PDF', 'warning');
      return;
    }

    // Verificar si ya existe contrato
    const eventoSeleccionado = contratos.find(c => c.EventId === parseInt(uploadContractId));
    const tieneContrato = eventoSeleccionado?.ContractRoute;

    if (tieneContrato) {
      const confirmar = window.confirm(
        `Este evento ya tiene un contrato (N° ${eventoSeleccionado.ContractNumber}). ¿Deseas reemplazarlo?`
      );
      if (!confirmar) return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('eventId', uploadContractId);

      addToast(tieneContrato ? 'Reemplazando contrato...' : 'Subiendo contrato...', 'info');

      const response = await api.post('/contracts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;
      addToast(data.message || 'Contrato procesado exitosamente', 'success');
      
      // Limpiar formulario
      setPdfFile(null);
      setUploadContractId('');
      document.getElementById('fileInput').value = '';
      
      // Recargar contratos
      fetchContratos();
    } catch (error) {
      console.error("Error al enviar contrato:", error);
      addToast(error.response?.data?.error || error.message || 'Error al procesar el contrato', 'danger');
    }
  };


  // === DESCARGAR CONTRATO ===
  const handleDescargar = async () => {
    if (!selectedContractId) {
      addToast('Por favor, selecciona un contrato', 'warning');
      return;
    }

    try {
      addToast('Descargando contrato...', 'info');

      const response = await api.get(`/contracts/download/${selectedContractId}`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contratoSeleccionado = contratos.find(c => c.EventId === parseInt(selectedContractId));
      link.setAttribute('download', `Contrato_${contratoSeleccionado?.EventName || 'Evento'}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addToast('Contrato descargado exitosamente', 'success');
    } catch (error) {
      console.error("Error al descargar:", error);
      addToast('Error al descargar el contrato', 'danger');
    }
  };

  // Separar eventos
  const eventosConContrato = contratos.filter(c => c.ContractRoute);
  const todosLosEventos = contratos; // Para subir/reemplazar cualquier evento

  if (loading) {
    return (
      <div className="contrato-container mt-10">
        <HeaderCl />
        <div className="contrato-wrapper">
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Cargando eventos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="contrato-container mt-11">
      <HeaderCl />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="contrato-wrapper">
        {/* Sección de Descarga */}
        <div className="contrato-card ">
          <h2 className="contrato-subtitle">
            Descargar Contrato
          </h2>
          
          {eventosConContrato.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No tienes contratos disponibles para descargar
            </p>
          ) : (
            <>
              <div className="contrato-field">
                <div className="contrato-label">
                  Selecciona un contrato:
                </div>
                <select 
                  value={selectedContractId} 
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="form-select"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  <option value="">-- Selecciona un evento --</option>
                  {eventosConContrato.map(c => (
                    <option key={c.EventId} value={c.EventId}>
                      {c.EventName} - Contrato N° {c.ContractNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="contrato-actions">
                <button 
                  onClick={handleDescargar} 
                  className="btn-primary-custom btn"
                  disabled={!selectedContractId}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                  </svg>
                  Descargar
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sección de Subida/Reemplazo */}
        <div className="contrato-card">
          <h2 className="contrato-subtitle">
            Subir o Reemplazar Contrato
          </h2>
          
          {todosLosEventos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No tienes eventos registrados
            </p>
          ) : (
            <>
              <div className="contrato-field">
                <div className="contrato-label">
                  Selecciona un evento:
                </div>
                <select 
                  value={uploadContractId} 
                  onChange={(e) => setUploadContractId(e.target.value)}
                  className="form-select"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  <option value="">-- Selecciona un evento --</option>
                  {todosLosEventos.map(c => (
                    <option key={c.EventId} value={c.EventId}>
                      {c.EventName} {c.ContractRoute ? `(Contrato N° ${c.ContractNumber})` : '(Sin contrato)'}
                    </option>
                  ))}
                </select>
              </div>

              {pdfFile && (
                <div style={{ 
                  padding: '10px', 
                  background: '#f0f9ff', 
                  borderRadius: '8px', 
                  marginTop: '12px',
                  color: '#0369a1',
                  fontSize: '0.9rem'
                }}>
                  Archivo cargado: {pdfFile.name}
                </div>
              )}
              
              <div className="contrato-actions">
                <label className="btn-primary-custom btn" style={{ cursor: 'pointer' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                    <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                  </svg>
                  Cargar PDF
                  <input 
                    id="fileInput"
                    type="file" 
                    accept="application/pdf"
                    onChange={handleCargarContrato}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button 
                  onClick={handleEnviarContrato} 
                  className="btn-secondary-custom btn w-100"
                  disabled={!uploadContractId || !pdfFile}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                  </svg>
                  {uploadContractId && contratos.find(c => c.EventId === parseInt(uploadContractId))?.ContractRoute 
                    ? 'Reemplazar Contrato' 
                    : 'Subir Contrato'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractsClient;