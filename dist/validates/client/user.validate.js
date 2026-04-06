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
Object.defineProperty(exports, "__esModule", { value: true });
// POST /v1/users/check-exists/email
const checkExistsEmail = (req, res, next) => {
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
const checkExistsPhone = (req, res, next) => {
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
const updateBio = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { bio } = req.body;
    if (!bio) {
        return res.status(400).json({
            status: false,
            message: "Input required!",
        });
    }
    return next();
});
// PATCH /v1/users/location/:id
const updateLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
const userValidate = {
    checkExistsEmail,
    checkExistsPhone,
    updateBio,
    updateLocation,
};
exports.default = userValidate;
