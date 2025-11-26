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
};
export default messageController;