import React from 'react';
import api from '../../utils/axiosConfig';

const PdfDownloadLink = ({ fileName, displayName, className, style, children }) => {
  const handleDownloadPDF = async (e) => {
    e.preventDefault();
    try {
      // Intentar descargar del servidor público primero
      const response = await fetch(`/${fileName}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Abrir en nueva ventana
        const newWindow = window.open(url);
        if (!newWindow) {
          // Si popup bloqueado, descargar
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
        }
      } else {
        throw new Error('No se pudo cargar el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo abrir el archivo. Por favor, intenta de nuevo.');
    }
  };

  return (
    <a
      href="#"
      onClick={handleDownloadPDF}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
};

export default PdfDownloadLink;
