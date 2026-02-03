import { Server, Socket } from "socket.io";

import {
  ERoomChatRole,
  ERoomChatStatus,
  ERoomChatType,
} from "../../enums/roomChat.enum";
import SocketEvent from "../../enums/socketEvent.enum";
import userService from "../../services/client/user.service";
import roomChatService from "../../services/client/roomChat.service";
import {
  ClientAcceptFriendRequestDto,
  ClientDeleteFriendAcceptDto,
  ClientRejectFriendRequestDto,
} from "../../dtos/user.dto";
import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

const acceptFriendRequest = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_ACCEPT_FRIEND_REQUEST,
    async (data: ClientAcceptFriendRequestDto) => {
      const { userId, userRequestId } = data;

      const title = `${userRequestId}-${userId}`;
      const slug: string =
        slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();

      const newRoomChat = await roomChatService.create({
        doc: {
          title: `${userRequestId}-${userId}`,
          slug,
          avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU7ipaznyPz6nmwqsZOursrDCUDeOOYkd0IQ&s",
          type: ERoomChatType.friend,
          status: ERoomChatStatus.active,
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
      const userRequestExists = await userService.findOneAndUpdate({
        filter: { _id: userRequestId, friendAccepts: userId },
        update: {
          $pull: { friendAccepts: userId },
          $push: {
            friends: { userId: userId, roomChatId: newRoomChat.id },
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
      if (!userRequestExists) {
        console.log({
          _id: userRequestId,
          friendAccepts: userId,
          error: "User request id not found",
        });

        await roomChatService.deleteOne({ filter: { _id: newRoomChat.id } });

        return;
      }

      io.emit(SocketEvent.SERVER_RESPONSE_ACCEPT_FRIEND_REQUEST, {
        userId,
        userRequestId,
        roomChatId: newRoomChat.id,
      });
    }
  );
};

const rejectFriendRequest = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_REJECT_FRIEND_REQUEST,
    async (data: ClientRejectFriendRequestDto) => {
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
    }
  );
};

const deleteFriendAccept = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_DELETE_FRIEND_ACCEPT,
    async (data: ClientDeleteFriendAcceptDto) => {
      const { userId, userRequestId } = data;

      const userExists = await userService.findOneAndUpdate({
        filter: { _id: userId, friendAccepts: userRequestId },
        update: {
          $pull: { friendAccepts: userRequestId },
        },
      });
      const userRequestExists = await userService.findOneAndUpdate({
        filter: { _id: userRequestId, friendRequests: userId },
        update: {
          $pull: { friendRequests: userId },
        },
      });

      if (!userExists || !userRequestExists) {
        console.log({
          userId,
          userRequestId,
        });

        return;
      }

      io.emit(SocketEvent.SERVER_RESPONSE_DELETE_FRIEND_ACCEPT, {
        userId,
        userRequestId,
      });
    }
  );
};

const register = (socket: Socket, io: Server) => {
  acceptFriendRequest(socket, io);
  rejectFriendRequest(socket, io);
  deleteFriendAccept(socket, io);
};

const userSocket = {
  acceptFriendRequest,
  deleteFriendAccept,
  rejectFriendRequest,
  register,
};
export default userSocket;
