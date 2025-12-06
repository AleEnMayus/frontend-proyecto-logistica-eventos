import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const handleGoBackBrowser = () => {
    navigate(`/`);
  };
  return (
    <div>
      <header className="bg-white shadow-sm sticky-top header-container">
        <div className="container">
          <div className="row align-items-center py-3 justify-content-between">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <button onClick={handleGoBackBrowser} className="back-btn me-4 mb-0" title="Volver">
                  ‹
                </button>
                <div className="logo-text">
                  Happy-Art-Events
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className='d-flex flex-column justify-content-center align-items-center' style={{ minHeight: '100vh', padding: '40px 16px' }}>
        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ gap: 12 }}>
          <h1 className='h1 text-muted' style={{ fontSize: 'clamp(72px, 18vw, 150px)', margin: 0 }}>404</h1>
          <p className='h2 text-muted' style={{ fontSize: 'clamp(18px, 3vw, 40px)', margin: 0 }}>Página no encontrada</p>
          <p className='h5 text-muted' style={{ fontWeight: 400, maxWidth: 640 }}>No pudimos encontrar la página que estabas buscando. Es posible que se haya movido o que la dirección esté incorrecta.</p>

          <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
            <button
              className="btn-primary-custom"
              onClick={() => navigate('/')}
              style={{ padding: '8px 18px' }}
            >
              Volver al inicio
            </button>

            <button
              className="btn-secondary-custom"
              onClick={() => navigate(-1)}
              style={{ padding: '8px 18px' }}
            >
              Volver
            </button>
          </div>

          {/* Small helper link */}
          <button
            onClick={() => window.location.reload()}
            className="link-like text-muted"
            style={{ marginTop: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
            title="Recargar página"
          >
            ¿Problema temporal? Intenta recargar la página
          </button>
        </div>
      </div>
    </div>
  );
}
