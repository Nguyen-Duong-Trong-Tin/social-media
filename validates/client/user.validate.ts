import { NextFunction, Request, Response } from "express";

// POST /v1/users/check-exists/email
const checkExistsEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Input required",
    });
  }

  return next();
};

// POST /v1/users/check-exists/phone
const checkExistsPhone = (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      status: false,
      message: "Input required",
    });
  }

  return next();
};

// PATCH /v1/users/bio/:id
const updateBio = async (req: Request, res: Response, next: NextFunction) => {
  const { bio } = req.body;

  if (!bio) {
    return res.status(400).json({
      status: false,
      message: "Input required",
    });
  }

  return next();
};

const userValidate = {
  checkExistsEmail,
  checkExistsPhone,
  updateBio,
};
export default userValidate;
