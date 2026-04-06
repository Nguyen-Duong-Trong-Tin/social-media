import { NextFunction, Request, Response } from "express";

// POST /v1/users/check-exists/email
const checkExistsEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Input required!",
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
      message: "Input required!",
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
      message: "Input required!",
    });
  }

  return next();
};

// PATCH /v1/users/location/:id
const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { lat, lng, visibility } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({
      status: false,
      message: "Latitude and longitude are required",
    });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      status: false,
      message: "Invalid coordinates",
    });
  }

  if (visibility && visibility !== "friends" && visibility !== "everyone") {
    return res.status(400).json({
      status: false,
      message: "Invalid visibility",
    });
  }

  return next();
};

const userValidate = {
  checkExistsEmail,
  checkExistsPhone,
  updateBio,
  updateLocation,
};
export default userValidate;
