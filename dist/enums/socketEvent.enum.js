"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketEvent;
(function (SocketEvent) {
    SocketEvent["CLIENT_SEND_MESSAGE_TO_AI_ASSISTANT"] = "client.send.message.to.ai.assistant";
    SocketEvent["SERVER_RESPONSE_MESSAGE_TO_AI_ASSISTANT"] = "server.response.message.to.ai.assistant";
    SocketEvent["CLIENT_ACCEPT_FRIEND_REQUEST"] = "client.accept.friend.request";
    SocketEvent["SERVER_RESPONSE_ACCEPT_FRIEND_REQUEST"] = "server.response.accept.friend.request";
    SocketEvent["CLIENT_REJECT_FRIEND_REQUEST"] = "client.reject.friend.request";
    SocketEvent["SERVER_RESPONSE_REJECT_FRIEND_REQUEST"] = "server.response.reject.friend.request";
    SocketEvent["CLIENT_DELETE_FRIEND_ACCEPT"] = "client.delete.friend.accept";
    SocketEvent["SERVER_RESPONSE_DELETE_FRIEND_ACCEPT"] = "server.response.delete.friend.accept";
})(SocketEvent || (SocketEvent = {}));
exports.default = SocketEvent;
