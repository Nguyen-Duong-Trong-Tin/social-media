import { Server, Socket } from "socket.io";

import { Content, GoogleGenAI } from "@google/genai";

import {
  ERoomChatRole,
  ERoomChatStatus,
  ERoomChatType,
} from "../../enums/roomChat.enum";
import slugUtil from "../../utils/slug.util";
import SocketEvent from "../../enums/socketEvent.enum";
import groupService from "../../services/client/group.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import messageService from "../../services/client/message.service";
import roomChatService from "../../services/client/roomChat.service";
import { ClientSendMessageToAIAssistantDto } from "../../dtos/message.dto";

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

const register = (socket: Socket, io: Server) => {
  sendMessageToAiAssistant(socket, io);
};

const messageSocket = {
  sendMessageToAiAssistant,
  register,
};
export default messageSocket;
