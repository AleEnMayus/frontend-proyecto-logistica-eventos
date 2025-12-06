let logoutCallback = null;
let inactivityTime = 5 * 60 * 1000; 
let timeoutId = null;

const resetTimer = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (logoutCallback) logoutCallback();
  }, inactivityTime);
};

const start = (onLogout, customTime) => {
  logoutCallback = onLogout;
  if (customTime) inactivityTime = customTime;

  // Escuchar eventos de actividad
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keydown", resetTimer);
  window.addEventListener("click", resetTimer);
  window.addEventListener("scroll", resetTimer);

  resetTimer(); // Iniciar el timer
};

const stop = () => {
  clearTimeout(timeoutId);
  window.removeEventListener("mousemove", resetTimer);
  window.removeEventListener("keydown", resetTimer);
  window.removeEventListener("click", resetTimer);
  window.removeEventListener("scroll", resetTimer);
};

export default {
  start,
  stop,
};
