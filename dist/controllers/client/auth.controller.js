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
const md5_util_1 = __importDefault(require("../../utils/md5.util"));
const jwt_util_1 = __importDefault(require("../../utils/jwt.util"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const user_enum_1 = require("../../enums/user.enum");
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
                avatar: "",
                status: user_enum_1.EUserStatus.active,
                coverPhoto: "",
                bio: "",
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
const authController = {
    register,
    login,
    verifyAccessToken,
    refreshToken,
};
exports.default = authController;
