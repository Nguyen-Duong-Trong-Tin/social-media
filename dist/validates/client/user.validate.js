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
            message: "Input required",
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
            message: "Input required",
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
            message: "Input required",
        });
    }
    return next();
});
const userValidate = {
    checkExistsEmail,
    checkExistsPhone,
    updateBio,
};
exports.default = userValidate;
