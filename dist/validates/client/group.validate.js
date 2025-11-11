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
// PATCH /v1/users/description/:id
const updateDescription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description) {
        return res.status(400).json({
            status: false,
            message: "Input required",
        });
    }
    return next();
});
// PATCH /v1/users/invitation/:id
const updateInvitation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { invitation } = req.body;
    if (!invitation) {
        return res.status(400).json({
            status: false,
            message: "Input required",
        });
    }
    return next();
});
const groupValidate = {
    updateDescription,
    updateInvitation,
};
exports.default = groupValidate;
