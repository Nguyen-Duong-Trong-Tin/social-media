import { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import slugUtil from "../../utils/slug.util";
import sortHelper from "../../helpers/sort.helper";
import TaskGroupModel from "../../models/taskGroup.model";
import userService from "../../services/client/user.service";
import { ETaskGroupStatus } from "../../enums/taskGroup.enum";
import paginationHelper from "../../helpers/pagination.helper";
import groupService from "../../services/client/group.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import taskGroupService from "../../services/client/taskGroup.service";
import taskGroupSubmissionService from "../../services/client/taskGroupSubmission.service";

// POST /v1/taskGroups
const create = async (req: any, res: Response) => {
  try {
    const title: string = req.body.title;
    const slug: string =
      slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;

    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status: ETaskGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupId: string = req.body.groupId;
    const deadline = new Date(req.body.deadline);

    const [taskGroupSlugExists, userExists, groupExists] = await Promise.all([
      taskGroupService.findOne({ filter: { slug } }),
      userService.findOne({ filter: { _id: userId } }),
      groupService.findOne({ filter: { _id: groupId } }),
    ]);
    if (taskGroupSlugExists) {
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
    if (!groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    const createdBy: {
      userId: string;
      createdAt: Date;
    } = {
      userId,
      createdAt: new Date(),
    };
    const imagePaths = (images || []).map((image) => (image as any).path);
    const videoPaths = (videos || []).map((video) => (video as any).path);

    const newTaskGroup = await taskGroupService.create({
      doc: {
        title,
        slug,
        description,
        images: imagePaths,
        videos: videoPaths,
        status,
        groupId,
        createdBy,
        deadline,
        deleted: false,
      },
    });
    return res.status(200).json({
      status: true,
      message: "Task group created successfully",
      data: newTaskGroup,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/taskGroups/:id
const update = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const title = req.body.title;
    const slug = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description = req.body.description;
    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const status = req.body.status;
    const userId = req.body.userId;
    const groupId = req.body.groupId;
    const deadline = new Date(req.body.deadline);
    const imagesRemoved = JSON.parse(req.body.imagesRemoved);
    const videosRemoved = JSON.parse(req.body.videosRemoved);

    const [taskGroupExists, taskGroupSlugExists, userExists, groupExists] =
      await Promise.all([
        taskGroupService.findOne({ filter: { _id: id } }),
        taskGroupService.findOne({ filter: { slug } }),
        userService.findOne({ filter: { _id: userId } }),
        groupService.findOne({ filter: { _id: groupId } }),
      ]);
    if (!taskGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Task group id not found",
      });
    }
    if (title && taskGroupSlugExists) {
      return res.status(500).json({
        status: false,
        message: "Something went wrong. Please try again",
      });
    }
    if (userId && !userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }
    if (groupId && !groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    const createdBy: {
      userId: string;
      createdAt: Date;
    } = {
      userId,
      createdAt: new Date(),
    };
    const imagePaths = (images || []).map((image) => (image as any).path);
    const videoPaths = (videos || []).map((video) => (video as any).path);

    let newTaskGroup = await taskGroupService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $pull: {
          images: { $in: imagesRemoved },
          videos: { $in: videosRemoved },
        },
        // $push: {
        //   images: { $each: imagePaths  },
        //   videos: { $each: videoPaths },
        //   materials: { $each: materialPaths },
        // },
        $set: {
          title,
          slug: title ? slug : undefined,
          description,
          status,
          groupId,
          createdBy: userId ? createdBy : undefined,
          deadline,
        },
      },
    });

    newTaskGroup = await taskGroupService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $push: {
          images: { $each: imagePaths },
          videos: { $each: videoPaths },
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Task group updated successfully",
      data: newTaskGroup,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// DELETE /v1/taskGroups/:id
const del = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const taskGroupExists = await taskGroupService.findOneAndUpdate({
      filter: { _id: id },
      update: { deleted: true },
    });
    if (!taskGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Task group id not found",
      });
    }

    await taskGroupSubmissionService.updateMany({
      filter: { taskGroupId: id },
      update: { deleted: true },
    });

    return res.status(200).json({
      status: true,
      message: "Task group deleted successfully",
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Seomthing went wrong",
    });
  }
};

// GET /v1/taskGroups?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof TaskGroupModel> = {};

    if (filter) {
      const { title, slug, description, status, groupId } = JSON.parse(filter);

      if (title) {
        filterOptions.title = new RegExp(title, "i");
      }

      if (slug) {
        filterOptions.slug = new RegExp(slug, "i");
      }

      if (description) {
        filterOptions.description = new RegExp(description, "i");
      }

      if (status) {
        filterOptions.status = status;
      }

      if (groupId) {
        filterOptions.groupId = groupId;
      }
    }

    const [total, items] = await Promise.all([
      taskGroupService.countDocuments({ filter: filterOptions }),
      taskGroupService.find({
        filter: filterOptions,
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Task groups found",
      data: {
        taskGroups: {
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

// GET /v1/taskGroups/:id
const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const taskGroupExists = await taskGroupService.findOne({
      filter: { _id: id },
    });
    if (!taskGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Task group id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Task group found",
      data: taskGroupExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const taskGroupController = {
  create,
  update,
  del,
  find,
  findById,
};
export default taskGroupController;
