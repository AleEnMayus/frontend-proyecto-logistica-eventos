import React from 'react';

const PDFLink = ({ href, fileName, children, className, style }) => {
  const handlePDFClick = async (e) => {
    e.preventDefault();
    try {
      // Fetch el PDF
      const response = await fetch(href);
      if (!response.ok) throw new Error('No se pudo cargar el archivo');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Crear un iframe para mostrar el PDF
      const iframeWindow = window.open('');
      iframeWindow.document.write(`
        <iframe 
          src="${url}" 
          style="width:100%; height:100%; border:none; margin:0; padding:0;" 
          title="${fileName}"
        ></iframe>
      `);
    } catch (error) {
      console.error('Error al cargar el PDF:', error);
      // Fallback a descarga
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      link.click();
    }
  };

  return (
    <a
      href={href}
      onClick={handlePDFClick}
      className={className}
      style={style}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export default PDFLink;
