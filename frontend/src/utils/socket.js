import { io } from "socket.io-client";

const socket = io("https://soulsync-52q9.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
