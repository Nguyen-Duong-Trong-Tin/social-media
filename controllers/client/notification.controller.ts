import { Request, Response } from "express";

import notificationService from "../../services/client/notification.service";
import ENotificationType from "../../enums/notification.enum";

const parseBoolean = (value?: string) => {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const notificationController = {
  find: async (req: Request, res: Response) => {
    try {
      const { userId, type, isRead, limit } = req.query as {
        userId?: string;
        type?: string;
        isRead?: string;
        limit?: string;
      };

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "userId is required",
        });
      }

      const filter: Record<string, unknown> = { userId };
      if (type) filter.type = type;

      const parsedRead = parseBoolean(isRead);
      if (parsedRead !== undefined) {
        filter.isRead = parsedRead;
      }

      const items = await notificationService.find({
        filter,
        sort: { createdAt: -1 },
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        status: true,
        message: "Notifications found",
        data: { items },
      });
    } catch {
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }
  },
  unreadCount: async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as { userId?: string };

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "userId is required",
        });
      }

      const [total, messages, friendRequests] = await Promise.all([
        notificationService.countDocuments({
          filter: { userId, isRead: false },
        }),
        notificationService.countDocuments({
          filter: { userId, isRead: false, type: ENotificationType.message },
        }),
        notificationService.countDocuments({
          filter: {
            userId,
            isRead: false,
            type: ENotificationType.friend_request,
          },
        }),
      ]);

      return res.status(200).json({
        status: true,
        message: "Unread count",
        data: {
          total,
          byType: {
            message: messages,
            friend_request: friendRequests,
          },
        },
      });
    } catch {
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }
  },
  markRead: async (req: Request, res: Response) => {
    try {
      const { userId, type, roomChatId } = req.body as {
        userId?: string;
        type?: string;
        roomChatId?: string;
      };

      if (!userId) {
        return res.status(400).json({
          status: false,
          message: "userId is required",
        });
      }

      const filter: Record<string, unknown> = { userId, isRead: false };
      if (type) {
        filter.type = type;
      }
      if (roomChatId) {
        filter["data.roomChatId"] = roomChatId;
      }

      const result = await notificationService.updateMany({
        filter,
        update: { $set: { isRead: true } },
      });

      return res.status(200).json({
        status: true,
        message: "Notifications marked as read",
        data: {
          modifiedCount: result.modifiedCount ?? 0,
        },
      });
    } catch {
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }
  },
};

export default notificationController;
