import { Server, Socket } from "socket.io";
import messageSocket from "./message.socket";

const register = (socket: Socket, io: Server) => {
  messageSocket.register(socket, io);
}

const clientSocket = {
  register
};
export default clientSocket;