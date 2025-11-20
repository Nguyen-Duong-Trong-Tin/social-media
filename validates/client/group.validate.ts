import { NextFunction, Request, Response } from "express";
import { EGroupStatus } from "../../enums/group.enum";

// PATCH /v1/groups/description/:id
const updateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({
      status: false,
      message: "Input required",
    });
  }

  return next();
};

// PATCH /v1/groups/invitation/:id
const updateInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { invitation } = req.body;

  if (!invitation) {
    return res.status(400).json({
      status: false,
      message: "Input required",
    });
  }

  return next();
};

// POST /v1/groups
const create = (req: any, res: Response, next: NextFunction) => {
  try {
    const title = req.body.title;
    const avatar = req.files["avatar"];
    const coverPhoto = req.files["coverPhoto"];
    const status = req.body.status;
    const userId = req.body.userId;
    const groupTopicId = req.body.groupTopicId;

    if (
      !title ||
      !avatar ||
      !coverPhoto ||
      !status ||
      !userId ||
      !groupTopicId
    ) {
      return res.status(400).json({
        status: false,
        message: "Input required",
      });
    }

    if (
      typeof title !== "string" ||
      typeof status !== "string" ||
      typeof userId !== "string" ||
      typeof groupTopicId !== "string"
    ) {
      return res.status(400).json({
        status: false,
        message: "Datatype wrong",
      });
    }

    if (!Object.values(EGroupStatus).includes(status as EGroupStatus)) {
      return res.status(400).json({
        status: false,
        message: "Status wrong",
      });
    }

    return next();
  } catch {
    req.flash("error", "Có lỗi xảy ra!");
    return res.redirect("back");
  }
};

const groupValidate = {
  updateDescription,
  updateInvitation,
  create,
};
export default groupValidate;
