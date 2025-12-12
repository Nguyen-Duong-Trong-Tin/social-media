import { Server, Socket } from "socket.io";

import {
  ERoomChatRole,
  ERoomChatStatus,
  ERoomChatType,
} from "../../enums/roomChat.enum";
import SocketEvent from "../../enums/socketEvent.enum";
import userService from "../../services/client/user.service";
import roomChatService from "../../services/client/roomChat.service";
import { ClientAcceptFriendRequestDto, ClientRejectFriendRequestDto } from "../../dtos/user.dto";

const acceptFriendRequest = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_ACCEPT_FRIEND_REQUEST,
    async (data: ClientAcceptFriendRequestDto) => {
      const { userId, userRequestId } = data;

      const newRoomChat = await roomChatService.create({
        doc: {
          type: ERoomChatType.friend,
          avatar: ERoomChatStatus.active,
          users: [
            { userId, role: ERoomChatRole.user },
            { userId: userRequestId, role: ERoomChatRole.user },
          ],
        },
      });

      const userExists = await userService.findOneAndUpdate({
        filter: { _id: userId, friendRequests: userRequestId },
        update: {
          $pull: { friendRequests: userRequestId },
          $push: {
            friends: { userId: userRequestId, roomChatId: newRoomChat.id },
          },
        },
      });
      if (!userExists) {
        console.log({
          _id: userId,
          friendRequests: userRequestId,
          error: "User id not found",
        });

        await roomChatService.deleteOne({ filter: { _id: newRoomChat.id } });

        return;
      }

      socket.emit(SocketEvent.SERVER_RESPONSE_ACCEPT_FRIEND_REQUEST, {
        userId,
        userRequestId,
        roomChatId: newRoomChat.id,
      });
    }
  );
};

const rejectFriendRequest = (socket: Socket, io: Server) => {
  socket.on(SocketEvent.CLIENT_REJECT_FRIEND_REQUEST, async (data: ClientRejectFriendRequestDto) => {
    const { userId, userRequestId } = data;

    const userRejectExists = await userService.findOneAndUpdate({
      filter: { _id: userId, friendRequests: userRequestId },
      update: {
        $pull: { friendRequests: userRequestId },
      },
    });
    const userRequestExists = await userService.findOneAndUpdate({
      filter: { _id: userRequestId, friendAccepts: userId },
      update: {
        $pull: { friendAccepts: userId },
      },
    });

    if (!userRejectExists || !userRequestExists) {
      console.log({
        userId,
        userRequestId,
      });

      return;
    }

    io.emit(SocketEvent.SERVER_RESPONSE_REJECT_FRIEND_REQUEST, {
      userId,
      userRequestId,
    });
  });
};

const register = (socket: Socket, io: Server) => {
  acceptFriendRequest(socket, io);
  rejectFriendRequest(socket, io);
};

const userSocket = {
  acceptFriendRequest,
  rejectFriendRequest,
  register,
};
export default userSocket;
