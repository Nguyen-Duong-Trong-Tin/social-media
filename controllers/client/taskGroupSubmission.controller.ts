import { Request, Response } from "express";

import slugUtil from "../../utils/slug.util";
import userService from "../../services/client/user.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import taskGroupService from "../../services/client/taskGroup.service";
import taskGroupSubmissionService from "../../services/client/taskGroupSubmission.service";

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
          },
        },
      });

    if (!taskGroupSubmissionExists) {
      if (taskGroupSubmissionSlugExists) {
        return res.status(500).json({
          status: false,
          message: "Something went wrong. Please try again",
        });
      }
      
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

const taskGroupSubmissionController = {
  findByUserIdAndTaskGroupIds,
  submit,
};
export default taskGroupSubmissionController;
