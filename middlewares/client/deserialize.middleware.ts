import { NextFunction, Request, Response } from "express";

import jwtUtil from "../../utils/jwt.util";

const deserialize = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ");

    if (!token || token[0] !== "Bearer" || !token[1]) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const verify: {
      success: boolean;
      account: {
        accountId: string;
        permissions: string[];
      };
    } = jwtUtil.accountVerify(token[1]);
    if (!verify.success) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
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

export default deserialize;
