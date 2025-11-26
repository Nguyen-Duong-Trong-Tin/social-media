"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_socket_1 = __importDefault(require("./message.socket"));
const register = (socket, io) => {
    message_socket_1.default.register(socket, io);
};
const clientSocket = {
    register
};
exports.default = clientSocket;
