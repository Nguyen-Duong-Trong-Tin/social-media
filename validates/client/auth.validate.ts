import { NextFunction, Request, Response } from "express";

const register = (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, confirmPassword, phone } = req.body;

  if (!fullName || !email || !password || !confirmPassword || !phone) {
    return res.status(400).json({
      status: false,
      message: "Input required!",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: false,
      message: "Password and confirm password not same",
    });
  }

  return next();
};

const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Input required!",
    });
  }

  return next();
};

const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.accesstoken;

  if (!accessToken) {
    return res.status(400).json({
      status: false,
      message: "Input required!",
    });
  }

  return next();
};

const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      status: false,
      message: "Input required!",
    });
  }

  return next();
};

const authValidate = {
  register,
  login,
  verifyAccessToken,
  refreshToken,
};
export default authValidate;
