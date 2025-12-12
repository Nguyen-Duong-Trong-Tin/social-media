import { Server, Socket } from "socket.io";

import userSocket from "./user.socket";
import messageSocket from "./message.socket";

const register = (socket: Socket, io: Server) => {
  messageSocket.register(socket, io);
  userSocket.register(socket, io);
}

const clientSocket = {
  register
};
export default clientSocket;