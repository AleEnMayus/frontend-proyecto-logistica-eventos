import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    
    setToasts((prev) => {
      const next = [...prev, { id, message, type, removing: false }];
      return next.slice(-5);
    });

    const removeTimer = setTimeout(() => {
      setToasts((prev) => 
        prev.map((t) => t.id === id ? { ...t, removing: true } : t)
      );
    }, 4500);

    const deleteTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);

    return () => {
      clearTimeout(removeTimer);
      clearTimeout(deleteTimer);
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => 
      prev.map((t) => t.id === id ? { ...t, removing: true } : t)
    );
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 500);
  }, []);

  return { toasts, addToast, removeToast };
}