import { io } from "socket.io-client";

const socket = io("https://soul-sync-omega.vercel.app", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
