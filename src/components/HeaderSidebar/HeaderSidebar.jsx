import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Views/CSS/components.css';

const HeaderSidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="gradiante-bg shadow-sm sticky-top header-container">
        <div className="container d-flex justify-content-between align-items-center py-3">
          
          {/* Logo + menú */}
          <div className="d-flex align-items-center">
            <button className="menu-btn me-3" onClick={toggleMenu}>
              ☰
            </button>
            <a href="/" className="navbar-brand d-flex align-items-center">
              <img src="/Logo-White.png" className="img-50" alt="Logo" />
              <div className="logo-text ms-2">Happy-Art-Events</div>
            </a>
          </div>

          {/* Botones de acción */}
          <div className="d-flex align-items-center gap-1 flex-wrap btn-sidebar-header">
            <a 
              href="/Register" 
              className="btn btn-secondary-custom sm-btn"
            >
              Registro
            </a>
            <Link 
              to="/Login" 
              className="btn btn-secondary-custom sm-btn"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Fondo oscuro cuando el menú está abierto */}
      <div
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="p-4 mt-5 pt-5">
          <nav className="mt-5">
            {/* Ahora sí sube hasta arriba */}
            <button
              className="sidebar-menu-item border-0 bg-transparent w-100 text-start"
              onClick={() => {
                scrollToTop();
                toggleMenu();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentcolor"><path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z" /></svg>
              Inicio
            </button>

            <a href="/login" className="sidebar-menu-item">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="currentcolor"><path d="M693.33-80v-120h-120v-66.67h120v-120H760v120h120V-200H760v120h-66.67Zm-506.66-80q-27 0-46.84-19.83Q120-199.67 120-226.67v-520q0-27 19.83-46.83 19.84-19.83 46.84-19.83h56.66V-880h70v66.67h253.34V-880h70v66.67h56.66q27 0 46.84 19.83Q760-773.67 760-746.67V-464q-16.67-2.33-33.33-2.33-16.67 0-33.34 2.33v-102.67H186.67v340h306.66q0 16.67 3 33.34 3 16.66 9 33.33H186.67Zm0-473.33h506.66v-113.34H186.67v113.34Zm0 0v-113.34 113.34Z" /></svg>
            Agendar Cita</a>
          </nav>
        </div>
      </div>
    </>
  );
};

export default HeaderSidebar;
