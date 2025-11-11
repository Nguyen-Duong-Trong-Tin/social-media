import { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import sortHelper from "../../helpers/sort.helper";
import GroupTopicModel from "../../models/groupTopic.model";
import paginationHelper from "../../helpers/pagination.helper";
import groupTopicService from "../../services/client/groupTopic.service";

// GET /v1/groupTopics?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof GroupTopicModel> = {};

    if (filter) {
      const { title, slug, description } = JSON.parse(filter);

      if (title) {
        filterOptions.title = new RegExp(title, "i");
      }

      if (slug) {
        filterOptions.slug = new RegExp(slug, "i");
      }

      if (description) {
        filterOptions.description = new RegExp(description, "i");
      }
    }

    const [total, items] = await Promise.all([
      groupTopicService.countDocuments({ filter: filterOptions }),
      groupTopicService.find({
        filter: filterOptions,
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Group topics found",
      data: {
        groupTopics: {
          total,
          page: pagination.page,
          limit: pagination.limit,
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

// GET /v1/groupTopics/:id
const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const groupTopicExists = await groupTopicService.findOne({
      filter: { _id: id },
    });
    if (!groupTopicExists) {
      return res.status(404).json({
        status: false,
        message: "Group topic id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Group topic found",
      data: groupTopicExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/groupTopics/slug/:slug
const findBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const groupTopicExists = await groupTopicService.findOne({
      filter: { slug },
    });
    if (!groupTopicExists) {
      return res.status(404).json({
        status: false,
        message: "Group topic slug not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Group topic found",
      data: groupTopicExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const groupTopicController = {
  find,
  findById,
  findBySlug,
};
export default groupTopicController;
