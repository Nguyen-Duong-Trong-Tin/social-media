import { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import slugUtil from "../../utils/slug.util";
import sortHelper from "../../helpers/sort.helper";
import sendMailHelper from "../../helpers/sendMail.helper";
import userService from "../../services/client/user.service";
import paginationHelper from "../../helpers/pagination.helper";
import groupService from "../../services/client/group.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import taskGroupService from "../../services/client/taskGroup.service";
import TaskGroupSubmissionModel from "../../models/taskGroupSubmission.model";
import taskGroupSubmissionService from "../../services/client/taskGroupSubmission.service";

// GET /v1/groups?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof TaskGroupSubmissionModel> = {};

    if (filter) {
      const { title, slug, description, status, taskGroupId } =
        JSON.parse(filter);

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

      if (taskGroupId) {
        filterOptions.taskGroupId = taskGroupId;
      }
    }

    const [total, items] = await Promise.all([
      taskGroupSubmissionService.countDocuments({ filter: filterOptions }),
      taskGroupSubmissionService.find({
        filter: filterOptions,
        skip: pagination.skip,
        limit: pagination.limit,
        sort,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Task group submissions found",
      data: {
        taskGroupSubmissions: {
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

// GET /v1/groups/slug/:slug
const findBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const taskGroupSubmissionExists = await taskGroupSubmissionService.findOne({
      filter: { slug },
    });
    if (!taskGroupSubmissionExists) {
      return res.status(404).json({
        status: false,
        message: "Task group submission slug not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Task group submission exists",
      data: taskGroupSubmissionExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/taskGroupSubmissions/find-by-user-id-and-task-group-ids
const findByUserIdAndTaskGroupIds = async (req: Request, res: Response) => {
  try {
    const { userId, taskGroupIds } = req.body;

    const taskGroupSubmissions = await taskGroupSubmissionService.find({
      filter: {
        "createdBy.userId": userId,
        taskGroupId: { $in: taskGroupIds },
      },
    });

    const map = new Map<string, any>();
    for (const s of taskGroupSubmissions) {
      map.set(String(s.taskGroupId), s);
    }

    const ordered = taskGroupIds.map(
      (id: string) => map.get(String(id)) ?? null
    );

    return res.status(200).json({
      status: true,
      message: "Task group submissions found",
      data: {
        taskGroupSubmissions: ordered,
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/taskGroupSubmissions/submit
const submit = async (req: any, res: Response) => {
  try {
    const title = req.body.title;
    const slug = slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description = req.body.description;
    const images: string[] = req.files["images"];
    const videos: string[] = req.files["videos"];
    const materials: string[] = req.files["materials"];
    const status = req.body.status;
    const userId = req.body.userId;
    const taskGroupId = req.body.taskGroupId;
    const imagesRemoved = JSON.parse(req.body.imagesRemoved);
    const videosRemoved = JSON.parse(req.body.videosRemoved);
    const materialsRemoved = JSON.parse(req.body.materialsRemoved);

    const [taskGroupSubmissionSlugExists, userExists, taskGroupExists] =
      await Promise.all([
        taskGroupSubmissionService.findOne({ filter: { slug } }),
        userService.findOne({ filter: { _id: userId } }),
        taskGroupService.findOne({ filter: { _id: taskGroupId } }),
      ]);
    if (taskGroupSubmissionSlugExists) {
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
    if (!taskGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Task group id not found",
      });
    }

    const createdBy = {
      userId,
      createdAt: new Date(),
    };
    const imagePaths = (images || []).map((image) => (image as any).path);
    const videoPaths = (videos || []).map((video) => (video as any).path);
    const materialPaths = (materials || []).map(
      (material) => (material as any).path
    );

    let taskGroupSubmissionExists =
      await taskGroupSubmissionService.findOneAndUpdate({
        filter: { "createdBy.userId": userId, taskGroupId },
        update: {
          $pull: {
            images: { $in: imagesRemoved },
            videos: { $in: videosRemoved },
            materials: { $in: materialsRemoved },
          },
          // $push: {
          //   images: { $each: imagePaths  },
          //   videos: { $each: videoPaths },
          //   materials: { $each: materialPaths },
          // },
          $set: {
            title,
            description,
            slug,
          },
        },
      });

    if (!taskGroupSubmissionExists) {
      const newTaskGroupSubmission = await taskGroupSubmissionService.create({
        doc: {
          title,
          slug,
          description,
          images: imagePaths,
          videos: videoPaths,
          materials: materialPaths,
          status,
          taskGroupId,
          createdBy,
          deleted: false,
        },
      });

      return res.status(201).json({
        status: true,
        message: "Task group submission created successfully",
        data: newTaskGroupSubmission,
      });
    }

    taskGroupSubmissionExists =
      await taskGroupSubmissionService.findOneAndUpdate({
        filter: { "createdBy.userId": userId, taskGroupId },
        update: {
          $push: {
            images: { $each: imagePaths },
            videos: { $each: videoPaths },
            materials: { $each: materialPaths },
          },
        },
      });

    return res.status(201).json({
      status: true,
      message: "Task group submission submited successfully",
      data: taskGroupSubmissionExists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/taskGroupSubmissions/scoring/:id
const scoring = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, comment, scoredBy, scoredAt } = req.body;

    const taskGroupSubmissionExists =
      await taskGroupSubmissionService.findOneAndUpdate({
        filter: { _id: id },
        update: { score, comment, scoredBy, scoredAt },
        options: { timestamps: false },
      });
    if (!taskGroupSubmissionExists) {
      return res.status(404).json({
        status: false,
        message: "Task group submission id not found",
      });
    }

    const userId = await taskGroupSubmissionExists.createdBy.userId;
    const userExists = await userService.findOne({
      filter: { _id: userId },
      select: "-password",
    });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const taskGroupId = taskGroupSubmissionExists.taskGroupId;
    const taskGroupExists = await taskGroupService.findOne({
      filter: { _id: taskGroupId },
    });
    if (!taskGroupExists) {
      return res.status(404).json({
        status: false,
        message: "Task group id not found",
      });
    }

    const groupId = taskGroupExists.groupId;
    const groupExists = await groupService.findOne({
      filter: { _id: groupId },
    });
    if (!groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    sendMailHelper({
      email: userExists.email,
      subject: `Your score for task group submission in ${groupExists.title} group`,
      html: `
            <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f9fa; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <img src="${groupExists.coverPhoto}" alt="Group Cover" style="width: 100%; height: auto;">
                <div style="padding: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 90px; vertical-align: middle;">
                        <img
                          src="${groupExists.avatar}"
                          alt="Group Avatar"
                          style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"
                        />
                      </td>
                      <td style="vertical-align: middle;">
                        <h2 style="margin: 0; color: #007BFF;">${groupExists.title}</h2>
                      </td>
                    </tr>
                  </table>
    
                  <p style="margin-top: 15px;">
                    Your task group submission has been scored.
                  </p>

                  <div style="text-align: center; margin-top: 25px;">
                    <a href="http://localhost:5173/group-profile/scoring/${taskGroupSubmissionExists.slug}"
                      style="background-color: #28a745; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                      See my score
                    </a>
                  </div>

                </div>
                <div style="background-color: #f1f3f5; text-align: center; padding: 10px; font-size: 13px; color: #777;">
                  © 2025 NodeJS Community. All rights reserved.
                </div>
              </div>
            </div>
            `,
    });

    return res.status(200).json({
      status: true,
      message: "Task group submission updated successfully",
      data: taskGroupSubmissionExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const taskGroupSubmissionController = {
  find,
  findBySlug,
  findByUserIdAndTaskGroupIds,
  submit,
  scoring,
};
export default taskGroupSubmissionController;
