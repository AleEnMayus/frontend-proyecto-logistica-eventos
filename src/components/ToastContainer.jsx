import React from "react";
import "../Views/CSS/toast.css";

const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <div className="toast-stack">
      {toasts.length > 0 ? (
        toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`custom-toast type-${toast.type} ${toast.removing ? 'removing' : ''}`}
          >
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              onClick={() => removeToast && removeToast(toast.id)}
              className="close-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </button>
          </div>
        ))
      ) : null}
    </div>
  );
};

export default ToastContainer;