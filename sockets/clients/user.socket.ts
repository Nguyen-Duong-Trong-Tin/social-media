import { Server, Socket } from "socket.io";

import {
  ERoomChatRole,
  ERoomChatStatus,
  ERoomChatType,
} from "../../enums/roomChat.enum";
import SocketEvent from "../../enums/socketEvent.enum";
import ENotificationType from "../../enums/notification.enum";
import userService from "../../services/client/user.service";
import roomChatService from "../../services/client/roomChat.service";
import notificationService from "../../services/client/notification.service";
import messageService from "../../services/client/message.service";
import {
  ClientAcceptFriendRequestDto,
  ClientDeleteFriendDto,
  ClientDeleteFriendAcceptDto,
  ClientRejectFriendRequestDto,
  ClientSendFriendRequestDto,
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

      await notificationService.insertMany({
        docs: [
          {
            userId: userRequestId,
            type: ENotificationType.friend_accept,
            title: "Friend request accepted",
            message: "Your friend request was accepted.",
            data: { fromUserId: userId, roomChatId: newRoomChat.id },
            isRead: false,
            deleted: false,
          },
        ],
      });

      io.emit(SocketEvent.SERVER_PUSH_NOTIFICATION, {
        userId: userRequestId,
        type: ENotificationType.friend_accept,
        data: { fromUserId: userId, roomChatId: newRoomChat.id },
      });
    },
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

      await notificationService.insertMany({
        docs: [
          {
            userId: userRequestId,
            type: ENotificationType.friend_reject,
            title: "Friend request declined",
            message: "Your friend request was declined.",
            data: { fromUserId: userId },
            isRead: false,
            deleted: false,
          },
        ],
      });

      io.emit(SocketEvent.SERVER_PUSH_NOTIFICATION, {
        userId: userRequestId,
        type: ENotificationType.friend_reject,
        data: { fromUserId: userId },
      });
    },
  );
};

const sendFriendRequest = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_SEND_FRIEND_REQUEST,
    async (data: ClientSendFriendRequestDto) => {
      const { userId, userRequestId } = data;

      if (userId === userRequestId) {
        return;
      }

      const userExists = await userService.findOneAndUpdate({
        filter: { _id: userId },
        update: {
          $addToSet: { friendAccepts: userRequestId },
        },
      });
      const userRequestExists = await userService.findOneAndUpdate({
        filter: { _id: userRequestId },
        update: {
          $addToSet: { friendRequests: userId },
        },
      });

      if (!userExists || !userRequestExists) {
        if (userExists) {
          await userService.updateOne({
            filter: { _id: userId },
            update: { $pull: { friendAccepts: userRequestId } },
          });
        }

        if (userRequestExists) {
          await userService.updateOne({
            filter: { _id: userRequestId },
            update: { $pull: { friendRequests: userId } },
          });
        }

        return;
      }

      io.emit(SocketEvent.SERVER_RESPONSE_SEND_FRIEND_REQUEST, {
        userId,
        userRequestId,
      });

      await notificationService.insertMany({
        docs: [
          {
            userId: userRequestId,
            type: ENotificationType.friend_request,
            title: "New friend request",
            message: "You have a new friend request.",
            data: { fromUserId: userId },
            isRead: false,
            deleted: false,
          },
        ],
      });

      io.emit(SocketEvent.SERVER_PUSH_NOTIFICATION, {
        userId: userRequestId,
        type: ENotificationType.friend_request,
        data: { fromUserId: userId },
      });
    },
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
    },
  );
};

const deleteFriend = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_DELETE_FRIEND,
    async (data: ClientDeleteFriendDto) => {
      const { userId, userRequestId } = data;

      const userExists = await userService.findOne({
        filter: { _id: userId },
      });

      const friendEntry = userExists?.friends?.find(
        (friend) => friend.userId === userRequestId,
      );

      if (!friendEntry) {
        return;
      }

      await userService.updateOne({
        filter: { _id: userId },
        update: { $pull: { friends: { userId: userRequestId } } },
      });

      await userService.updateOne({
        filter: { _id: userRequestId },
        update: { $pull: { friends: { userId: userId } } },
      });

      if (friendEntry.roomChatId) {
        await roomChatService.deleteOne({
          filter: { _id: friendEntry.roomChatId },
        });
      }

      io.emit(SocketEvent.SERVER_RESPONSE_DELETE_FRIEND, {
        userId,
        userRequestId,
      });
    },
  );
};

const updateLocation = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_UPDATE_LOCATION,
    async (data: { userId: string }) => {
      io.emit(SocketEvent.SERVER_LOCATION_UPDATED, {
        userId: data.userId,
      });
    },
  );
};

const callOffer = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_CALL_OFFER,
    async (data: {
      fromUserId: string;
      toUserId: string;
      roomChatId: string;
      offer: Record<string, unknown>;
      callType: "audio" | "video";
    }) => {
      io.emit(SocketEvent.SERVER_CALL_OFFER, data);
    },
  );
};

const callAnswer = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_CALL_ANSWER,
    async (data: {
      fromUserId: string;
      toUserId: string;
      roomChatId: string;
      answer: Record<string, unknown>;
    }) => {
      io.emit(SocketEvent.SERVER_CALL_ANSWER, data);
    },
  );
};

const callIce = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_CALL_ICE,
    async (data: {
      fromUserId: string;
      toUserId: string;
      roomChatId: string;
      candidate: Record<string, unknown>;
    }) => {
      io.emit(SocketEvent.SERVER_CALL_ICE, data);
    },
  );
};

const callEnd = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_CALL_END,
    async (data: {
      fromUserId: string;
      toUserId: string;
      roomChatId: string;
      durationSeconds?: number;
      callType?: "audio" | "video";
      endReason?: "declined" | "missed" | "ended" | "canceled";
    }) => {
      io.emit(SocketEvent.SERVER_CALL_END, data);

      const typeLabel = data.callType === "video" ? "Video call" : "Audio call";
      const hasDuration = (data.durationSeconds || 0) > 0;
      const minutes = Math.floor((data.durationSeconds || 0) / 60);
      const seconds = (data.durationSeconds || 0) % 60;
      const durationText = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
      const content = hasDuration
        ? `${typeLabel} • ${durationText}`
        : data.endReason === "declined"
          ? `${typeLabel} • Declined`
          : data.endReason === "canceled"
            ? `${typeLabel} • Canceled`
            : `${typeLabel} • Missed`;

      const [newMessage] = await messageService.insertMany({
        docs: [
          {
            content,
            userId: data.fromUserId,
            roomChatId: data.roomChatId,
            deleted: false,
          },
        ],
      });

      io.emit(SocketEvent.SERVER_RESPONSE_MESSAGE_TO_ROOM_CHAT, {
        _id: newMessage?._id,
        userId: data.fromUserId,
        roomChatId: data.roomChatId,
        content,
        images: [],
        videos: [],
        materials: [],
        pinned: false,
        pinnedBy: "",
        pinnedAt: null,
        createdAt: newMessage?.createdAt,
        deleted: false,
      });
    },
  );
};

const callUpgradeRequest = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_CALL_UPGRADE_REQUEST,
    async (data: {
      fromUserId: string;
      toUserId: string;
      roomChatId: string;
    }) => {
      io.emit(SocketEvent.SERVER_CALL_UPGRADE_REQUEST, data);
    },
  );
};

const callUpgradeResponse = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_CALL_UPGRADE_RESPONSE,
    async (data: {
      fromUserId: string;
      toUserId: string;
      roomChatId: string;
      accepted: boolean;
    }) => {
      io.emit(SocketEvent.SERVER_CALL_UPGRADE_RESPONSE, data);
    },
  );
};

const register = (socket: Socket, io: Server) => {
  acceptFriendRequest(socket, io);
  sendFriendRequest(socket, io);
  rejectFriendRequest(socket, io);
  deleteFriendAccept(socket, io);
  deleteFriend(socket, io);
  updateLocation(socket, io);
  callOffer(socket, io);
  callAnswer(socket, io);
  callIce(socket, io);
  callEnd(socket, io);
  callUpgradeRequest(socket, io);
  callUpgradeResponse(socket, io);
};

const userSocket = {
  acceptFriendRequest,
  sendFriendRequest,
  deleteFriendAccept,
  deleteFriend,
  rejectFriendRequest,
  updateLocation,
  callOffer,
  callAnswer,
  callIce,
  callEnd,
  callUpgradeRequest,
  callUpgradeResponse,
  register,
};
export default userSocket;
