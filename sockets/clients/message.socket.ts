import { Server, Socket } from "socket.io";

import { Content, GoogleGenAI } from "@google/genai";

import {
  ERoomChatRole,
  ERoomChatStatus,
  ERoomChatType,
} from "../../enums/roomChat.enum";
import slugUtil from "../../utils/slug.util";
import SocketEvent from "../../enums/socketEvent.enum";
import ENotificationType from "../../enums/notification.enum";
import groupService from "../../services/client/group.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import messageService from "../../services/client/message.service";
import roomChatService from "../../services/client/roomChat.service";
import notificationService from "../../services/client/notification.service";
import {
  ClientSendMessageToAIAssistantDto,
  ClientSendMessageToRoomChatDto,
  ClientTypingToRoomChatDto,
} from "../../dtos/message.dto";

const sendMessageToAiAssistant = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_SEND_MESSAGE_TO_AI_ASSISTANT,
    async (data: ClientSendMessageToAIAssistantDto) => {
      const { userId, message, groupId } = data;

      let [groupExists, roomChatExists] = await Promise.all([
        groupService.findOne({
          filter: { _id: groupId },
        }),
        roomChatService.findOne({
          filter: {
            users: {
              $all: [
                { $elemMatch: { userId: userId } },
                { $elemMatch: { userId: groupId } },
              ],
            },
            type: ERoomChatType.friend,
          },
        }),
      ]);
      if (!groupExists) {
        console.log({
          userId,
          groupId,
          error: "Group id not found",
        });

        return;
      }

      const historyContents: Content[] = [];

      if (!roomChatExists) {
        const title = `${userId}-${groupId}`;
        const slug: string =
          slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();

        roomChatExists = await roomChatService.create({
          doc: {
            title,
            slug,
            type: ERoomChatType.friend,
            avatar:
              "https://img.cand.com.vn/resize/800x800/NewFiles/Images/2022/05/09/1_call-1652057570914.png",
            status: ERoomChatStatus.active,
            users: [
              {
                userId,
                role: ERoomChatRole.user,
              },
              {
                userId: groupId,
                role: ERoomChatRole.user,
              },
            ],
            userRequests: [],
          },
        });
      } else {
        const messages = (await messageService.find({
          filter: { roomChatId: roomChatExists.id },
          sort: { createdAt: "desc" },
          limit: 4,
        })).reverse();

        for (const message of messages) {
          const role = message.userId === userId ? "user" : "model";

          historyContents.push({
            role: role,
            parts: [{ text: message.content }],
          });
        }
      }

      historyContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      const geminiModel = process.env.GEMINI_MODEL as string;

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: historyContents,
        config: {
          systemInstruction: {
            role: "system",
            parts: [
              {
                text: `This is a group about ${groupExists.title}`,
              },
            ],
          },
        },
      });

      await messageService.insertMany({
        docs: [
          {
            content: message,
            userId,
            roomChatId: roomChatExists.id,
          },
          {
            content: response.text,
            userId: groupId,
            roomChatId: roomChatExists.id,
          },
        ],
      });

      socket.emit(SocketEvent.SERVER_RESPONSE_MESSAGE_TO_AI_ASSISTANT, {
        userId,
        groupId,
        message: response.text,
      });
    }
  );
};

const sendMessageToRoomChat = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_SEND_MESSAGE_TO_ROOM_CHAT,
    async (data: ClientSendMessageToRoomChatDto) => {
      const { userId, roomChatId, content, images, videos, materials } = data;

      if (
        !content?.trim() &&
        (!images || images.length === 0) &&
        (!videos || videos.length === 0) &&
        (!materials || materials.length === 0)
      ) {
        return;
      }

      const roomChatExists = await roomChatService.findOne({
        filter: {
          _id: roomChatId,
          users: { $elemMatch: { userId } },
          status: ERoomChatStatus.active,
        },
      });

      if (!roomChatExists) {
        console.log({
          userId,
          roomChatId,
          error: "Room chat not found or user not in room",
        });

        return;
      }

      const [newMessage] = await messageService.insertMany({
        docs: [
          {
            content: content || "",
            images: images || [],
            videos: videos || [],
            materials: materials || [],
            userId,
            roomChatId,
          },
        ],
      });

      const recipients = (roomChatExists?.users || [])
        .map((user) => user.userId)
        .filter((recipientId) => recipientId && recipientId !== userId);

      if (recipients.length > 0) {
        const messageText =
          content?.trim() ||
          (images?.length || videos?.length || materials?.length
            ? "Sent an attachment"
            : "Sent a message");

        await notificationService.insertMany({
          docs: recipients.map((recipientId) => ({
            userId: recipientId,
            type: ENotificationType.message,
            title: "New message",
            message: messageText,
            data: {
              roomChatId,
              fromUserId: userId,
            },
            isRead: false,
            deleted: false,
          })),
        });

        recipients.forEach((recipientId) => {
          io.emit(SocketEvent.SERVER_PUSH_NOTIFICATION, {
            userId: recipientId,
            type: ENotificationType.message,
            data: { roomChatId, fromUserId: userId },
          });
        });
      }

      io.emit(SocketEvent.SERVER_RESPONSE_MESSAGE_TO_ROOM_CHAT, {
        userId,
        roomChatId,
        content: content || "",
        images: images || [],
        videos: videos || [],
        materials: materials || [],
        createdAt: newMessage?.createdAt,
      });
    }
  );
};

const typingToRoomChat = (socket: Socket, io: Server) => {
  socket.on(
    SocketEvent.CLIENT_TYPING_TO_ROOM_CHAT,
    async (data: ClientTypingToRoomChatDto) => {
      const { userId, roomChatId, isTyping } = data;

      if (!roomChatId || !userId) {
        return;
      }

      io.emit(SocketEvent.SERVER_RESPONSE_TYPING_TO_ROOM_CHAT, {
        userId,
        roomChatId,
        isTyping,
      });
    }
  );
};

const register = (socket: Socket, io: Server) => {
  sendMessageToAiAssistant(socket, io);
  sendMessageToRoomChat(socket, io);
  typingToRoomChat(socket, io);
};

const messageSocket = {
  sendMessageToAiAssistant,
  sendMessageToRoomChat,
  typingToRoomChat,
  register,
};
export default messageSocket;
