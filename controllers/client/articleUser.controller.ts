import { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import sortHelper from "../../helpers/sort.helper";
import paginationHelper from "../../helpers/pagination.helper";
import ArticleUserModel from "../../models/articleUser.model";
import articleUserService from "../../services/client/articleUser.service";
import userService from "../../services/client/user.service";
import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import { EArticleUserStatus } from "../../enums/articleUser.enum";

const parseExistingMedia = (value?: unknown) => {
  if (!value) return [] as string[];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [] as string[];

  const trimmed = value.trim();
  if (!trimmed) return [] as string[];

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // fall through to delimiter split
    }
  }

  return trimmed
    .split(/[,;|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const uniqueList = (items: string[]) => Array.from(new Set(items));

// GET /v1/articleUsers?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof ArticleUserModel> = {};

    if (filter) {
      const { title, slug, status, userId } = JSON.parse(filter);

      if (title) {
        filterOptions.title = new RegExp(title, "i");
      }

      if (slug) {
        filterOptions.slug = new RegExp(slug, "i");
      }

      if (status) {
        filterOptions.status = status;
      }

      if (userId) {
        filterOptions["createdBy.userId"] = userId;
      }
    }

    const [total, items] = await Promise.all([
      articleUserService.countDocuments({ filter: filterOptions }),
      articleUserService.find({
        filter: filterOptions,
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Article users found",
      data: {
        articleUsers: {
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

// GET /v1/articleUsers/:id
const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articleUserExists = await articleUserService.findOne({
      filter: { _id: id },
    });
    if (!articleUserExists) {
      return res.status(404).json({
        status: false,
        message: "Article user id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Article user found",
      data: articleUserExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/articleUsers/slug/:slug
const findBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const articleUserExists = await articleUserService.findOne({
      filter: { slug },
    });
    if (!articleUserExists) {
      return res.status(404).json({
        status: false,
        message: "Article user slug not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Article user found",
      data: articleUserExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/articleUsers
const create = async (req: any, res: Response) => {
  try {
    const { title, description, userId } = req.body;
    const images: any[] = req.files?.["images"] || [];
    const videos: any[] = req.files?.["videos"] || [];

    if (!title || !description || !userId) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    const slug = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();

    const [articleUserSlugExists, userExists] = await Promise.all([
      articleUserService.findOne({ filter: { slug } }),
      userService.findOne({ filter: { _id: userId } }),
    ]);

    if (articleUserSlugExists) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong. Please try again",
      });
    }
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const createdBy = {
      userId,
      createdAt: new Date(),
    };

    const imagePaths = (images || []).map((image) => image.path);
    const videoPaths = (videos || []).map((video) => video.path);

    const newArticleUser = await articleUserService.create({
      doc: {
        title,
        slug,
        description,
        images: imagePaths,
        videos: videoPaths,
        status: EArticleUserStatus.active,
        createdBy,
        deleted: false,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Article created successfully",
      data: newArticleUser,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/articleUsers/:id
const update = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, userId, status, existingImages, existingVideos } = req.body;
    const images: any[] = req.files?.["images"] || [];
    const videos: any[] = req.files?.["videos"] || [];

    const articleUserExists = await articleUserService.findOne({
      filter: { _id: id },
    });
    if (!articleUserExists) {
      return res.status(404).json({
        status: false,
        message: "Article user id not found",
      });
    }

    if (!userId || articleUserExists.createdBy?.userId !== userId) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    let slug: string | undefined;
    if (title && title !== articleUserExists.title) {
      slug = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
      const slugExists = await articleUserService.findOne({ filter: { slug } });
      if (slugExists) {
        return res.status(500).json({
          status: false,
          message: "Something went wrong. Please try again",
        });
      }
    }

    const imagePaths = (images || []).map((image) => image.path);
    const videoPaths = (videos || []).map((video) => video.path);
    const mergedImages = uniqueList([
      ...parseExistingMedia(existingImages),
      ...imagePaths,
    ]);
    const mergedVideos = uniqueList([
      ...parseExistingMedia(existingVideos),
      ...videoPaths,
    ]);

    const updatedArticleUser = await articleUserService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $set: {
          title: title ?? undefined,
          slug: slug ?? undefined,
          description: description ?? undefined,
          images: mergedImages.length ? mergedImages : undefined,
          videos: mergedVideos.length ? mergedVideos : undefined,
          status: status ?? undefined,
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Article updated successfully",
      data: updatedArticleUser,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// DELETE /v1/articleUsers/:id
const del = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const articleUserExists = await articleUserService.findOne({
      filter: { _id: id },
    });
    if (!articleUserExists) {
      return res.status(404).json({
        status: false,
        message: "Article user id not found",
      });
    }

    if (!userId || articleUserExists.createdBy?.userId !== userId) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    const deleted = await articleUserService.del({ id });

    return res.status(200).json({
      status: true,
      message: "Article deleted successfully",
      data: deleted,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const articleUserController = {
  find,
  findById,
  findBySlug,
  create,
  update,
  del,
};

export default articleUserController;
