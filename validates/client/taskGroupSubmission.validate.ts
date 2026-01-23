import { NextFunction, Request, Response } from "express";
import { ETaskGroupSubmissionStatus } from "../../enums/taskGroupSubmission.enum";

// POST /v1/taskGroupSubmissions/submit
const submit = async (req: any, res: Response, next: NextFunction) => {
  try {
    const title = req.body.title;
    const images = req.files["images"];
    const videos = req.files["videos"];
    const materials = req.files["materials"];
    const status = req.body.status;
    const userId = req.body.userId;
    const taskGroupId = req.body.taskGroupId;

    if (!title || !status || !userId || !taskGroupId) {
      return res.status(400).json({
        status: false,
        message: "Input required!",
      });
    }

    if (
      typeof title !== "string" ||
      typeof status !== "string" ||
      typeof userId !== "string" ||
      typeof taskGroupId !== "string"
    ) {
      return res.status(400).json({
        status: false,
        message: "Datatype wrong",
      });
    }

    if (images && images.length > 6) {
      return res.status(400).json({
        status: false,
        message: "Max 6 images",
      });
    }

    if (videos && videos.length > 6) {
      return res.status(400).json({
        status: false,
        message: "Max 6 videos",
      });
    }

    if (materials && materials.length > 6) {
      return res.status(400).json({
        status: false,
        message: "Max 6 materials",
      });
    }

    if (
      !Object.values(ETaskGroupSubmissionStatus).includes(
        status as ETaskGroupSubmissionStatus
      )
    ) {
      return res.status(400).json({
        status: false,
        message: "Status wrong",
      });
    }

    return next();
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/taskGroupSubmission/scoring/:id
const scoring = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, comment, scoredBy, scoredAt } = req.body;

    if (
      score === undefined ||
      scoredBy === undefined ||
      scoredAt === undefined
    ) {
      return res.status(400).json({
        status: false,
        message: "Input required!",
      });
    }

    if (
      typeof score !== "number" ||
      (comment !== undefined && typeof comment !== "string")
    ) {
      return res.status(400).json({
        status: false,
        message: "Datatype wrong",
      });
    }

    return next();
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const taskGroupSubmissionValidate = {
  submit,
  scoring,
};
export default taskGroupSubmissionValidate;
