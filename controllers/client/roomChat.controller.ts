import { Request, Response } from "express";

import { ERoomChatType } from "../../enums/roomChat.enum";
import roomChatService from "../../services/client/roomChat.service";

// GET /v1/roomChats/ai-assistant/:userId
const findByAiAssistantAndUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const roomChatExists = await roomChatService.findOne({
      filter: {
        users: {
          $all: [
            { $elemMatch: { userId: userId } },
            { $elemMatch: { userId: "" } },
          ],
        },
        type: ERoomChatType.friend,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Room chat found",
      data: roomChatExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const roomChatController = {
  findByAiAssistantAndUserId,
};
export default roomChatController;