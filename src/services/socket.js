import { io } from "socket.io-client";

const user = JSON.parse(sessionStorage.getItem("user") || "{}");
const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const socket = io(socketURL, {
  auth: {
    userId: user?.id,
    role: user?.role,
  },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Socket conectado con ID:", socket.id);

  if (user?.role === "admin") {
    socket.emit("joinRoom", "admins"); // unir admin a sala de admins
    console.log("Usuario unido a sala: admins");
  } else if (user?.id) {
    socket.emit("joinRoom", user.id); // unir cliente a su sala
    console.log(`Usuario unido a sala: user_${user.id}`);
  }
});
