import React, { useState, useEffect } from 'react';
import api from "../../../utils/axiosConfig";
import HeaderAdm from "../../../components/HeaderSidebar/HeaderAdm";
import { useToast } from "../../../hooks/useToast";
import ToastContainer from "../../../components/ToastContainer";
import "../../CSS/components.css";
import "../../CSS/FormsUser.css";

const ContractsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const itemsPerPage = 3;

  //  FETCH CONTRATOS 
  const fetchContratos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contracts/list');
      setContratos(response.data);
      
      if (response.data.length === 0) {
        addToast('No hay contratos registrados', 'info');
      }
    } catch (error) {
      console.error("Error al cargar contratos:", error);
      addToast('Error al cargar los contratos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContratos();
  }, []);

  // FUNCIONES DE ACCIÓN 
  const handleDownload = async (eventId, eventName) => {
    try { 
      addToast('Descargando contrato...', 'info');
      
      const response = await api.get(`/contracts/download/${eventId}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_${eventName}.pdf`);
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

  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el contrato de "${eventName}"?`)) return;
    
    try {
      const response = await api.delete(`/contracts/delete/${eventId}`);
      addToast(response.data.message || 'Contrato eliminado correctamente', 'success');
      fetchContratos(); // refresca la lista
    } catch (error) {
      console.error("Error al eliminar:", error);
      addToast('Error al eliminar el contrato', 'danger');
    }
  };

  const handleSendEmail = async (eventId, eventName) => {
    try {
      addToast('Enviando correo...', 'info');
      
      const response = await api.post(`/contracts/send-email/${eventId}`);
      addToast(`Correo enviado exitosamente a ${response.data.emailSentTo}`, 'success');
    } catch (error) {
      console.error("Error al enviar correo:", error);
      addToast('Error al enviar el correo', 'danger');
    }
  };

  // FILTRO Y PAGINACIÓN 
  const filteredContratos = contratos.filter(c => 
    c.EventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ClientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredContratos.length / itemsPerPage);
  
  const getCurrentPageContratos = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContratos.slice(start, start + itemsPerPage);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    buttons.push(
      <button 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
        className="pagination-arrow"
      >
        «
      </button>
    );
    
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)} 
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    buttons.push(
      <button 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages} 
        className="pagination-arrow"
      >
        »
      </button>
    );
    
    return buttons;
  };

  if (loading) {
    return (
      <div className="login-content mt-5 pt-5">
        <HeaderAdm />
        <div className="login-form-card">
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Cargando contratos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-content mt-5 pt-5">
      <HeaderAdm />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="login-form-card contracts-card">
        <h1 className="login-title">Listado De Contratos</h1>

        <div className="form-row form-input" style={{ marginBottom: 20 }}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            height="24px" 
            viewBox="0 -960 960 960" 
            width="24px" 
            fill="currentcolor"
          >
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por evento o cliente..." 
            value={searchTerm} 
            onChange={e => { 
              setSearchTerm(e.target.value); 
              setCurrentPage(1); 
            }} 
            style={{ border: 0, outline: 'none', flex: 1 }} 
          />
        </div>

        {filteredContratos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No se encontraron contratos</p>
          </div>
        ) : (
          <>
            <div className="contratos-list">
              {getCurrentPageContratos().map(c => (
                <div className="contrato-item form-row" key={c.EventId}>
                  <div style={{ flex: 1 }}>
                    <span className="contrato-text" style={{ color: '#2c3e50', fontWeight: 600 }}>
                      {c.EventName}
                    </span>
                    {c.ClientName && (
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: 4 }}>
                        Cliente: {c.ClientName}
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-column align-items-center contrato-actions" style={{ gap: 8 }}>
                    <button 
                      onClick={() => handleDownload(c.EventId, c.EventName)} 
                      className="btn-secondary-custom btn"
                    >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                  </svg>
                      Descargar
                    </button>
                    <button 
                      onClick={() => handleDelete(c.EventId, c.EventName)} 
                      className="btn-secondary-custom btn"
                    >
                  <svg xmlns="http://www.w3.org/2000/svg" className='me-2' height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                  </svg>
                      Eliminar
                    </button>
                    <button 
                      onClick={() => handleSendEmail(c.EventId, c.EventName)} 
                      className="btn-primary-custom btn"
                    >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentcolor">
                    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                  </svg>
                      Reenviar Correo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                <div className="pagination">{renderPaginationButtons()}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractsList;