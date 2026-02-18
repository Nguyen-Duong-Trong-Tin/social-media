import { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import sortHelper from "../../helpers/sort.helper";
import MessageModel from "../../models/message.model";
import paginationHelper from "../../helpers/pagination.helper";
import messageService from "../../services/client/message.service";

// GET /v1/messages?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    // const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof MessageModel> = {};

    if (filter) {
      const { content, userId, roomChatId } = JSON.parse(filter);

      if (content) {
        filterOptions.title = new RegExp(content, "i");
      }

      if (userId) {
        filterOptions.userId = userId;
      }

      if (roomChatId) {
        filterOptions.roomChatId = roomChatId;
      }
    }

    const [total, items] = await Promise.all([
      messageService.countDocuments({ filter: filterOptions }),
      messageService.find({
        filter: filterOptions,
        // skip: pagination.skip,
        // limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Group topics found",
      data: {
        messages: {
          total,
          // page: pagination.page,
          // limit: pagination.limit,
          items,
        },
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const messageController = {
  find,
  uploadImages: async (req: Request, res: Response) => {
    try {
      const files = (req as Request & { files?: any[] }).files || [];
      const images = files
        .map((file) => file?.path || file?.secure_url)
        .filter(Boolean);

      if (!images.length) {
        return res.status(400).json({
          status: false,
          message: "No images uploaded",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Images uploaded",
        data: { images },
      });
    } catch {
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
      });
    }
  },
};
export default messageController;