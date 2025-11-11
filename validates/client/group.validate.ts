import { NextFunction, Request, Response } from "express";

// PATCH /v1/users/description/:id
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

// PATCH /v1/users/invitation/:id
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

const groupValidate = {
  updateDescription,
  updateInvitation,
};
export default groupValidate;
