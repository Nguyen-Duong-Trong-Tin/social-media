"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const md5_util_1 = __importDefault(require("../../utils/md5.util"));
const jwt_util_1 = __importDefault(require("../../utils/jwt.util"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const user_enum_1 = require("../../enums/user.enum");
const sendMail_helper_1 = __importDefault(require("../../helpers/sendMail.helper"));
const buildFrontendRedirectUrl = ({ accessToken, refreshToken, userId, userSlug, error, }) => {
    const fallback = "http://localhost:5173/login";
    const base = process.env.GOOGLE_OAUTH_FRONTEND_REDIRECT || fallback;
    const redirectUrl = new URL(base);
    if (error) {
        redirectUrl.searchParams.set("error", error);
        return redirectUrl.toString();
    }
    if (accessToken)
        redirectUrl.searchParams.set("accessToken", accessToken);
    if (refreshToken)
        redirectUrl.searchParams.set("refreshToken", refreshToken);
    if (userId)
        redirectUrl.searchParams.set("userId", userId);
    if (userSlug)
        redirectUrl.searchParams.set("userSlug", userSlug);
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
// POST /v1/auth/register
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password, phone } = req.body;
        const slug = slug_util_1.default.convert(fullName) + "-" + shortUniqueKey_util_1.default.generate();
        const passwordDecoded = md5_util_1.default.encode(password);
        const [userSlugExists, userEmailExists, userPhoneExists] = yield Promise.all([
            user_service_1.default.findOne({ filter: { slug }, select: "-password" }),
            user_service_1.default.findOne({ filter: { email }, select: "-password" }),
            user_service_1.default.findOne({ filter: { phone }, select: "-password" }),
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
        const newUser = yield user_service_1.default.create({
            doc: {
                fullName,
                slug,
                email,
                password: passwordDecoded,
                phone,
                status: user_enum_1.EUserStatus.active,
                friends: [],
                friendAccepts: [],
                friendRequests: [],
                online: user_enum_1.EUserOnline.online,
                deleted: false,
            },
        });
        return res.status(201).json({
            status: true,
            message: "Register successfully",
            data: newUser,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// POST /v1/auth/login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const passwordDecoded = md5_util_1.default.encode(password);
        const userExists = yield user_service_1.default.findOne({
            filter: { email, password: passwordDecoded },
        });
        if (!userExists) {
            return res.status(400).json({
                status: false,
                message: "Email or password wrong",
            });
        }
        const accessToken = jwt_util_1.default.accountGenerate(userExists.id, [], "3d");
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 3,
        });
        const refreshToken = jwt_util_1.default.generateRefreshToken(userExists.id, [], "90d");
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 90,
        });
        yield user_service_1.default.updateOne({
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
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// GET /v1/auth/verify-access-token
const verifyAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers.accesstoken;
        const decoded = jwt_util_1.default.accountVerify(accessToken);
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
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// POST /v1/auth/refresh-token
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        const decoded = jwt_util_1.default.verfifyRefreshToken(refreshToken);
        if (!decoded.success) {
            return res.status(401).json({
                status: false,
                message: "Refresh token is invalid",
            });
        }
        const userExists = yield user_service_1.default.findOne({
            filter: { _id: decoded.account.accountId, refreshToken },
        });
        if (!userExists) {
            return res.status(401).json({
                status: false,
                message: "Refresh token is invalid",
            });
        }
        const newAccessToken = jwt_util_1.default.accountGenerate(userExists.id, [], "3d");
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
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// POST /v1/auth/forgot-password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const userExists = yield user_service_1.default.findOne({
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
            const resetToken = crypto_1.default.randomBytes(32).toString("hex");
            const resetPasswordToken = md5_util_1.default.encode(resetToken);
            const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            yield user_service_1.default.updateOne({
                filter: { _id: userExists.id },
                update: { resetPasswordToken, resetPasswordExpires },
            });
            const resetPasswordBaseUrl = process.env.CLIENT_RESET_PASSWORD_URL ||
                "http://localhost:5173/reset-password";
            const resetPasswordUrl = new URL(resetPasswordBaseUrl);
            resetPasswordUrl.searchParams.set("token", resetToken);
            resetPasswordUrl.searchParams.set("email", userExists.email);
            (0, sendMail_helper_1.default)({
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
            message: "If this email is registered, a password reset link has been sent.",
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// POST /v1/auth/reset-password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, token, password } = req.body;
        const resetPasswordToken = md5_util_1.default.encode(token);
        const userExists = yield user_service_1.default.findOne({
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
        yield user_service_1.default.updateOne({
            filter: { _id: userExists.id },
            update: {
                password: md5_util_1.default.encode(password),
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Password reset successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// GET /v1/auth/google
const googleLogin = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.redirect(buildGoogleAuthUrl());
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong.",
        });
    }
});
// GET /v1/auth/google/callback
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, error } = req.query;
        if (error) {
            return res.redirect(buildFrontendRedirectUrl({ error }));
        }
        if (!code) {
            return res.redirect(buildFrontendRedirectUrl({ error: "missing_code" }));
        }
        const tokenResponse = yield fetch("https://oauth2.googleapis.com/token", {
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
            return res.redirect(buildFrontendRedirectUrl({ error: "token_exchange_failed" }));
        }
        const tokenData = (yield tokenResponse.json());
        if (!tokenData.access_token) {
            return res.redirect(buildFrontendRedirectUrl({ error: "missing_access_token" }));
        }
        const userInfoResponse = yield fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });
        if (!userInfoResponse.ok) {
            return res.redirect(buildFrontendRedirectUrl({ error: "user_info_failed" }));
        }
        const userInfo = (yield userInfoResponse.json());
        if (!userInfo.email) {
            return res.redirect(buildFrontendRedirectUrl({ error: "missing_email" }));
        }
        const userExists = yield user_service_1.default.findOne({
            filter: { email: userInfo.email },
        });
        if (userExists) {
            if (userExists.authProvider !== "google") {
                return res.redirect(buildFrontendRedirectUrl({ error: "account_exists_local" }));
            }
            const accessToken = jwt_util_1.default.accountGenerate(userExists.id, [], "3d");
            const refreshToken = jwt_util_1.default.generateRefreshToken(userExists.id, [], "90d");
            yield user_service_1.default.updateOne({
                filter: { _id: userExists.id },
                update: { refreshToken },
            });
            return res.redirect(buildFrontendRedirectUrl({
                accessToken,
                refreshToken,
                userId: userExists.id,
                userSlug: userExists.slug,
            }));
        }
        const fullName = userInfo.name || userInfo.email.split("@")[0];
        const slug = slug_util_1.default.convert(fullName) + "-" + shortUniqueKey_util_1.default.generate();
        const password = md5_util_1.default.encode(shortUniqueKey_util_1.default.generate());
        const newUser = yield user_service_1.default.create({
            doc: {
                fullName,
                slug,
                email: userInfo.email,
                password,
                avatar: userInfo.picture || undefined,
                status: user_enum_1.EUserStatus.active,
                friends: [],
                friendAccepts: [],
                friendRequests: [],
                online: user_enum_1.EUserOnline.online,
                deleted: false,
                authProvider: "google",
                googleId: userInfo.sub,
            },
        });
        const accessToken = jwt_util_1.default.accountGenerate(newUser.id, [], "3d");
        const refreshToken = jwt_util_1.default.generateRefreshToken(newUser.id, [], "90d");
        yield user_service_1.default.updateOne({
            filter: { _id: newUser.id },
            update: { refreshToken },
        });
        return res.redirect(buildFrontendRedirectUrl({
            accessToken,
            refreshToken,
            userId: newUser.id,
            userSlug: newUser.slug,
        }));
    }
    catch (error) {
        console.error("Google OAuth callback error:", error);
        return res.redirect(buildFrontendRedirectUrl({ error: "unknown_error" }));
    }
});
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
exports.default = authController;
