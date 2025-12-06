// src/pages/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/LogOut.css";
import api from '../../utils/axiosConfig';
import { socket } from '../../services/socket';

const Logout = () => {
  const navigate = useNavigate();

    useEffect(() => {
      let mounted = true;

      const doLogout = async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          console.warn('Logout request failed', e.message || e);
        }

        try {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('role');
          sessionStorage.removeItem('name');
        } catch (e) {
          console.warn('Error cleaning sessionStorage', e);
        }

        // Desconectar socket si está conectado
        try {
          if (socket && socket.connected) {
            socket.disconnect();
          }
        } catch (e) {
          console.warn('Error disconnecting socket', e);
        }

        if (mounted) {
          navigate(0);
        }
      };

      // Pequeña animación de salida
      const timer = setTimeout(doLogout, 700);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }, [navigate]);

  return (
    <div className="logout-container">
      <div className="spinner"></div>
      <p>Cerrando sesión...</p>
    </div>
  );
};

export default Logout;
