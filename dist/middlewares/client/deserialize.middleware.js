"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_util_1 = __importDefault(require("../../utils/jwt.util"));
const deserialize = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ");
        if (!token || token[0] !== "Bearer" || !token[1]) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const verify = jwt_util_1.default.accountVerify(token[1]);
        if (!verify.success) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        return next();
    }
    catch (_b) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
};
exports.default = deserialize;
