import mongoose, { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import sortHelper from "../../helpers/sort.helper";
import paginationHelper from "../../helpers/pagination.helper";
import ArticleGroupModel from "../../models/articleGroup.model";
import articleGroupService from "../../services/client/articleGroup.service";
import groupService from "../../services/client/group.service";
import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import { EArticleGroupStatus } from "../../enums/articleGroup.enum";

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

type IArticleGroupLike = {
  userId: string;
  createdAt: Date;
};

type IArticleGroupComment = {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const ensureMemberPermission = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId?: string;
}) => {
  if (!userId) {
    return { statusCode: 400, message: "Missing required fields" };
  }

  const groupExists = await groupService.findOne({ filter: { _id: groupId } });
  if (!groupExists) {
    return { statusCode: 404, message: "Group id not found" };
  }

  const isMember = groupExists.users?.some((user) => user.userId === userId);
  if (!isMember) {
    return { statusCode: 403, message: "Forbidden" };
  }

  return { statusCode: 200, message: "OK" };
};

// GET /v1/articleGroups?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof ArticleGroupModel> = {};

    if (filter) {
      const { title, slug, status, groupId } = JSON.parse(filter);

      if (title) {
        filterOptions.title = new RegExp(title, "i");
      }

      if (slug) {
        filterOptions.slug = new RegExp(slug, "i");
      }

      if (status) {
        filterOptions.status = status;
      }

      if (groupId) {
        filterOptions.groupId = groupId;
      }
    }

    const [total, items] = await Promise.all([
      articleGroupService.countDocuments({ filter: filterOptions }),
      articleGroupService.find({
        filter: filterOptions,
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Article groups found",
      data: {
        articleGroups: {
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

// GET /v1/articleGroups/:id
const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articleGroupExists = await articleGroupService.findOne({
      filter: { _id: id },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Article group found",
      data: articleGroupExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/articleGroups/slug/:slug
const findBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const articleGroupExists = await articleGroupService.findOne({
      filter: { slug },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group slug not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Article group found",
      data: articleGroupExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/articleGroups
const create = async (req: any, res: Response) => {
  try {
    const { title, description, userId, groupId } = req.body;
    const images: any[] = req.files?.["images"] || [];
    const videos: any[] = req.files?.["videos"] || [];

    if (!title || !description || !userId || !groupId) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    const slug = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();

    const [articleGroupSlugExists, groupExists] = await Promise.all([
      articleGroupService.findOne({ filter: { slug } }),
      groupService.findOne({ filter: { _id: groupId } }),
    ]);

    if (articleGroupSlugExists) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong. Please try again",
      });
    }
    if (!groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    const isMember = groupExists.users?.some((user) => user.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    const createdBy = {
      userId,
      createdAt: new Date(),
    };

    const imagePaths = (images || []).map((image) => image.path);
    const videoPaths = (videos || []).map((video) => video.path);

    const newArticleGroup = await articleGroupService.create({
      doc: {
        title,
        slug,
        description,
        images: imagePaths,
        videos: videoPaths,
        status: EArticleGroupStatus.active,
        groupId,
        createdBy,
        deleted: false,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Article created successfully",
      data: newArticleGroup,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/articleGroups/:id
const update = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      userId,
      status,
      existingImages,
      existingVideos,
    } = req.body;
    const images: any[] = req.files?.["images"] || [];
    const videos: any[] = req.files?.["videos"] || [];

    const articleGroupExists = await articleGroupService.findOne({
      filter: { _id: id },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group id not found",
      });
    }

    if (!userId || articleGroupExists.createdBy?.userId !== userId) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    let slug: string | undefined;
    if (title && title !== articleGroupExists.title) {
      slug = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
      const slugExists = await articleGroupService.findOne({
        filter: { slug },
      });
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

    const updatedArticleGroup = await articleGroupService.findOneAndUpdate({
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
      data: updatedArticleGroup,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// DELETE /v1/articleGroups/:id
const del = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const articleGroupExists = await articleGroupService.findOne({
      filter: { _id: id },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group id not found",
      });
    }

    if (!userId || articleGroupExists.createdBy?.userId !== userId) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    const deleted = await articleGroupService.del({ id });

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

// PATCH /v1/articleGroups/:id/like
const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const articleGroupExists = await articleGroupService.findOne({
      filter: { _id: id },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group id not found",
      });
    }

    const permission = await ensureMemberPermission({
      groupId: articleGroupExists.groupId,
      userId,
    });
    if (permission.statusCode !== 200) {
      return res.status(permission.statusCode).json({
        status: false,
        message: permission.message,
      });
    }

    const likes = Array.isArray(articleGroupExists.likes)
      ? (articleGroupExists.likes as IArticleGroupLike[])
      : [];
    const hasLiked = likes.some((like) => like.userId === userId);

    const nextLikes = hasLiked
      ? likes.filter((like) => like.userId !== userId)
      : [...likes, { userId, createdAt: new Date() }];

    const updatedArticleGroup = await articleGroupService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $set: {
          likes: nextLikes,
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: hasLiked ? "Article unliked" : "Article liked",
      data: {
        liked: !hasLiked,
        likes: updatedArticleGroup?.likes ?? [],
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/articleGroups/:id/comments
const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;

    const articleGroupExists = await articleGroupService.findOne({
      filter: { _id: id },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group id not found",
      });
    }

    const permission = await ensureMemberPermission({
      groupId: articleGroupExists.groupId,
      userId,
    });
    if (permission.statusCode !== 200) {
      return res.status(permission.statusCode).json({
        status: false,
        message: permission.message,
      });
    }

    const normalizedContent = typeof content === "string" ? content.trim() : "";
    if (!normalizedContent) {
      return res.status(400).json({
        status: false,
        message: "Comment content is required",
      });
    }

    const comments = Array.isArray(articleGroupExists.comments)
      ? (articleGroupExists.comments as IArticleGroupComment[])
      : [];

    const newComment: IArticleGroupComment = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      content: normalizedContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedArticleGroup = await articleGroupService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $set: {
          comments: [...comments, newComment],
        },
      },
    });

    return res.status(201).json({
      status: true,
      message: "Comment created successfully",
      data: {
        comments: updatedArticleGroup?.comments ?? [],
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// DELETE /v1/articleGroups/:id/comments/:commentId
const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { userId } = req.body;

    const articleGroupExists = await articleGroupService.findOne({
      filter: { _id: id },
    });
    if (!articleGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Article group id not found",
      });
    }

    const permission = await ensureMemberPermission({
      groupId: articleGroupExists.groupId,
      userId,
    });
    if (permission.statusCode !== 200) {
      return res.status(permission.statusCode).json({
        status: false,
        message: permission.message,
      });
    }

    const comments = Array.isArray(articleGroupExists.comments)
      ? (articleGroupExists.comments as IArticleGroupComment[])
      : [];
    const targetComment = comments.find(
      (comment) => String(comment._id) === commentId,
    );

    if (!targetComment) {
      return res.status(404).json({
        status: false,
        message: "Comment not found",
      });
    }

    const canDeleteComment = targetComment.userId === userId;
    if (!canDeleteComment) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    const updatedArticleGroup = await articleGroupService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $set: {
          comments: comments.filter(
            (comment) => String(comment._id) !== commentId,
          ),
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Comment deleted successfully",
      data: {
        comments: updatedArticleGroup?.comments ?? [],
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const articleGroupController = {
  find,
  findById,
  findBySlug,
  create,
  update,
  del,
  toggleLike,
  createComment,
  deleteComment,
};

export default articleGroupController;
