import { Request, Response } from "express";

import md5Util from "../../utils/md5.util";
import jwtUtil from "../../utils/jwt.util";
import slugUtil from "../../utils/slug.util";
import userService from "../../services/client/user.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import { EUserOnline, EUserStatus } from "../../enums/user.enum";

// POST /v1/auth/register
const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const slug: string =
      slugUtil.convert(fullName) + "-" + shortUniqueKeyUtil.generate();
    const passwordDecoded: string = md5Util.encode(password);

    const [userSlugExists, userEmailExists, userPhoneExists] =
      await Promise.all([
        userService.findOne({ filter: { slug }, select: "-password" }),
        userService.findOne({ filter: { email }, select: "-password" }),
        userService.findOne({ filter: { phone }, select: "-password" }),
      ]);
    if (userSlugExists) {
      return res.status(400).json({
        status: false,
        message: "Server busy",
      });
    }
    if (userEmailExists) {
      return res.status(400).json({
        status: false,
        message: "Email already exists",
      });
    }
    if (userPhoneExists) {
      return res.status(400).json({
        status: false,
        message: "Phone already exists",
      });
    }

    const newUser = await userService.create({
      doc: {
        fullName,
        slug,
        email,
        password: passwordDecoded,
        phone,
        avatar: "",
        status: EUserStatus.active,
        coverPhoto: "",
        bio: "",
        friends: [],
        friendAccepts: [],
        friendRequests: [],
        online: EUserOnline.online,
        deleted: false,
      },
    });
    return res.status(201).json({
      status: true,
      message: "Register successfully",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

// POST /v1/auth/login
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const passwordDecoded: string = md5Util.encode(password);

    const userExists = await userService.findOne({
      filter: { email, password: passwordDecoded },
    });
    if (!userExists) {
      return res.status(400).json({
        status: false,
        message: "Email or password wrong",
      });
    }

    const accessToken = jwtUtil.accountGenerate(userExists.id, [], "3d");
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    const refreshToken = jwtUtil.generateRefreshToken(userExists.id, [], "90d");
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 90,
    });

    await userService.updateOne({
      filter: { _id: userExists.id },
      update: { refreshToken },
    });

    return res.status(200).json({
      status: true,
      message: "Login successfully",
      data: {
        accessToken,
        refreshToken,
        userSlug: userExists.slug,
        userId: userExists.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

// GET /v1/auth/verify-access-token
const verifyAccessToken = async (req: Request, res: Response) => {
  try {
    const accessToken = req.headers.accesstoken;

    const decoded = jwtUtil.accountVerify(accessToken as string);
    if (!decoded.success) {
      return res.status(401).json({
        status: false,
        message: "Access token is invalid",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Access token is valid",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

// POST /v1/auth/refresh-token
const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwtUtil.verfifyRefreshToken(refreshToken);
    if (!decoded.success) {
      return res.status(401).json({
        status: false,
        message: "Refresh token is invalid",
      });
    }

    const userExists = await userService.findOne({
      filter: { _id: decoded.account.accountId, refreshToken },
    });

    if (!userExists) {
      return res.status(401).json({
        status: false,
        message: "Refresh token is invalid",
      });
    }

    const newAccessToken = jwtUtil.accountGenerate(userExists.id, [], "3d");
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    return res.status(200).json({
      status: true,
      message: "Get new access token successfully",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

const authController = {
  register,
  login,
  verifyAccessToken,
  refreshToken,
};
export default authController;
