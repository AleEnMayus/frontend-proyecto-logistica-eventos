export function capitalize(text = "") {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function eraseUnderscore(text = "") {
  if (!text) return "";
  return text.replace(/_/g, " ");
}

// Functions to translate

export function translateRequestType(type) {
  const translations = {
    'schedule_appointment': 'Agendar Cita',
    'cancel_event': 'Cancelar Evento',
    'document_change': 'Cambio de Documento'
  };
  
  return translations[type] || eraseUnderscore(type);
};

export function translateStatus(status) {
  const translations = {
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'In_planning': 'En planeación',
    'In_execution': 'En ejecución',
    'Completed': 'Completado',
    'Canceled': 'Cancelado',
    'Cash': 'Efectivo',
    'Transfer': 'Transferencia',
    'Card': 'Tarjeta',
    'inactive': 'Inactiva',
    'active': 'Activa'
  };
  
  return translations[status] || status;
};