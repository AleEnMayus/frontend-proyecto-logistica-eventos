import { useEffect } from "react";
import { toast } from "react-toastify";
import { socket } from "../services/socket";

export default function useNotificationsToast() {
  useEffect(() => {
    if (!socket) return;

    // Notificaciones para admins
    socket.on("notification:admin", (data) => {
      console.log("Nueva notificación admin:", data);
      toast.info(data.message || "Nueva notificación admin", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    });

    // Notificaciones para clientes
    socket.on("notification:client", (data) => {
      console.log("Nueva notificación cliente:", data);
      toast.success(data.message || "Nueva notificación cliente", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    });

    return () => {
      socket.off("notification:admin");
      socket.off("notification:client");
    };
  }, []);
}