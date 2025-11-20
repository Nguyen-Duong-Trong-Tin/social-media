import { NextFunction, Response } from "express";
import { ETaskGroupStatus } from "../../enums/taskGroup.enum";

// POST /admin/taskGroups
const create = (req: any, res: Response, next: NextFunction) => {
  try {
    const title = req.body.title;
    const images = req.files["images"];
    const videos = req.files["videos"];
    const status = req.body.status;
    const userId = req.body.userId;
    const groupId = req.body.groupId;
    const deadline = req.body.deadline;

    if (!title || !status || !userId || !groupId || !deadline) {
      return res.status(400).json({
        status: false,
        message: "Input required",
      });
    }

    if (
      typeof title !== "string" ||
      typeof status !== "string" ||
      typeof userId !== "string" ||
      typeof groupId !== "string" ||
      typeof deadline !== "string" ||
      isNaN(new Date(deadline).getTime())
    ) {
      return res.status(400).json({
        status: false,
        message: "Datatype wrong",
      });
    }

    if (images && images.length > 6) {
      return res.status(400).json({
        status: false,
        messag: "Max 6 images",
      });
    }

    if (videos && videos.length > 6) {
      return res.status(400).json({
        status: false,
        message: "Max 6 videos",
      });
    }

    if (!Object.values(ETaskGroupStatus).includes(status as ETaskGroupStatus)) {
      return res.status(400).json({
        status: false,
        message: "Status wrong",
      });
    }

    if (new Date(deadline).getTime() < Date.now()) {
      return res.status(400).json({
        status: false,
        message: "Deadline wrong",
      });
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

const taskGroupValidate = {
  create,
};
export default taskGroupValidate;
