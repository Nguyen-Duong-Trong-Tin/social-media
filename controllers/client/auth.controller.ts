import { Request, Response } from "express";
import crypto from "crypto";

import md5Util from "../../utils/md5.util";
import jwtUtil from "../../utils/jwt.util";
import slugUtil from "../../utils/slug.util";
import userService from "../../services/client/user.service";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import { EUserOnline, EUserStatus } from "../../enums/user.enum";
import sendMailHelper from "../../helpers/sendMail.helper";
import { uploadImageFromUrl } from "../../utils/cloudinary.util";

const buildFrontendRedirectUrl = ({
  accessToken,
  refreshToken,
  userId,
  userSlug,
  error,
}: {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  userSlug?: string;
  error?: string;
}) => {
  const fallback = "http://localhost:5173/login";
  const base = process.env.GOOGLE_OAUTH_FRONTEND_REDIRECT || fallback;
  const redirectUrl = new URL(base);

  if (error) {
    redirectUrl.searchParams.set("error", error);
    return redirectUrl.toString();
  }

  if (accessToken) redirectUrl.searchParams.set("accessToken", accessToken);
  if (refreshToken) redirectUrl.searchParams.set("refreshToken", refreshToken);
  if (userId) redirectUrl.searchParams.set("userId", userId);
  if (userSlug) redirectUrl.searchParams.set("userSlug", userSlug);

  return redirectUrl.toString();
};

const buildGoogleAuthUrl = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || "";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const resolveGoogleAvatarUrl = async (avatarUrl?: string) => {
  if (!avatarUrl) return undefined;

  try {
    return await uploadImageFromUrl({ sourceUrl: avatarUrl });
  } catch (error) {
    return avatarUrl;
  }
};

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
        status: EUserStatus.active,
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

// POST /v1/auth/forgot-password
const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const userExists = await userService.findOne({
      filter: { email },
      select: "_id email fullName authProvider",
    });

    if (userExists && userExists.authProvider === "google") {
      return res.status(200).json({
        status: true,
        message: "This email uses Google login, please continue with Google",
      });
    }

    if (userExists && userExists.authProvider === "local") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetPasswordToken = md5Util.encode(resetToken);
      const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

      await userService.updateOne({
        filter: { _id: userExists.id },
        update: { resetPasswordToken, resetPasswordExpires },
      });

      const resetPasswordBaseUrl =
        process.env.CLIENT_RESET_PASSWORD_URL ||
        "http://localhost:5173/reset-password";
      const resetPasswordUrl = new URL(resetPasswordBaseUrl);
      resetPasswordUrl.searchParams.set("token", resetToken);
      resetPasswordUrl.searchParams.set("email", userExists.email);

      sendMailHelper({
        email: userExists.email,
        subject: "Reset your password",
        html: `
          <p>Hello ${userExists.fullName},</p>
          <p>We received a request to reset your password.</p>
          <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
          <p><a href="${resetPasswordUrl.toString()}">${resetPasswordUrl.toString()}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    }

    return res.status(200).json({
      status: true,
      message:
        "If this email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

// POST /v1/auth/reset-password
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, password } = req.body;

    const resetPasswordToken = md5Util.encode(token);

    const userExists = await userService.findOne({
      filter: {
        email,
        authProvider: "local",
        resetPasswordToken,
        resetPasswordExpires: { $gt: new Date() },
      },
    });

    if (!userExists) {
      return res.status(400).json({
        status: false,
        message: "Reset link is invalid or expired",
      });
    }

    await userService.updateOne({
      filter: { _id: userExists.id },
      update: {
        password: md5Util.encode(password),
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

// GET /v1/auth/google
const googleLogin = async (_req: Request, res: Response) => {
  try {
    return res.redirect(buildGoogleAuthUrl());
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
    });
  }
};

// GET /v1/auth/google/callback
const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query as {
      code?: string;
      error?: string;
    };

    if (error) {
      return res.redirect(buildFrontendRedirectUrl({ error }));
    }

    if (!code) {
      return res.redirect(buildFrontendRedirectUrl({ error: "missing_code" }));
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI || "",
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return res.redirect(
        buildFrontendRedirectUrl({ error: "token_exchange_failed" }),
      );
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenData.access_token) {
      return res.redirect(
        buildFrontendRedirectUrl({ error: "missing_access_token" }),
      );
    }

    const userInfoResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      return res.redirect(
        buildFrontendRedirectUrl({ error: "user_info_failed" }),
      );
    }

    const userInfo = (await userInfoResponse.json()) as {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };

    if (!userInfo.email) {
      return res.redirect(buildFrontendRedirectUrl({ error: "missing_email" }));
    }

    const userExists = await userService.findOne({
      filter: { email: userInfo.email },
    });

    if (userExists) {
      if (userExists.authProvider !== "google") {
        return res.redirect(
          buildFrontendRedirectUrl({ error: "account_exists_local" }),
        );
      }

      const avatar = await resolveGoogleAvatarUrl(userInfo.picture);

      const accessToken = jwtUtil.accountGenerate(userExists.id, [], "3d");
      const refreshToken = jwtUtil.generateRefreshToken(
        userExists.id,
        [],
        "90d",
      );

      await userService.updateOne({
        filter: { _id: userExists.id },
        update: {
          refreshToken,
          ...(avatar ? { avatar } : {}),
        },
      });

      return res.redirect(
        buildFrontendRedirectUrl({
          accessToken,
          refreshToken,
          userId: userExists.id,
          userSlug: userExists.slug,
        }),
      );
    }

    const fullName = userInfo.name || userInfo.email.split("@")[0];
    const slug: string =
      slugUtil.convert(fullName) + "-" + shortUniqueKeyUtil.generate();
    const password = md5Util.encode(shortUniqueKeyUtil.generate());
    const avatar = await resolveGoogleAvatarUrl(userInfo.picture);

    const newUser = await userService.create({
      doc: {
        fullName,
        slug,
        email: userInfo.email,
        password,
        avatar,
        status: EUserStatus.active,
        friends: [],
        friendAccepts: [],
        friendRequests: [],
        online: EUserOnline.online,
        deleted: false,
        authProvider: "google",
        googleId: userInfo.sub,
      },
    });

    const accessToken = jwtUtil.accountGenerate(newUser.id, [], "3d");
    const refreshToken = jwtUtil.generateRefreshToken(newUser.id, [], "90d");

    await userService.updateOne({
      filter: { _id: newUser.id },
      update: { refreshToken },
    });

    return res.redirect(
      buildFrontendRedirectUrl({
        accessToken,
        refreshToken,
        userId: newUser.id,
        userSlug: newUser.slug,
      }),
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(buildFrontendRedirectUrl({ error: "unknown_error" }));
  }
};

const authController = {
  register,
  login,
  verifyAccessToken,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleCallback,
};
export default authController;
