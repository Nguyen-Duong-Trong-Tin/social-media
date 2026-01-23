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
const group_enum_1 = require("../../enums/group.enum");
// PATCH /v1/groups/description/:id
const updateDescription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description) {
        return res.status(400).json({
            status: false,
            message: "Input required!",
        });
    }
    return next();
});
// PATCH /v1/groups/invitation/:id
const updateInvitation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { invitation } = req.body;
    if (!invitation) {
        return res.status(400).json({
            status: false,
            message: "Input required!",
        });
    }
    return next();
});
// POST /v1/groups
const create = (req, res, next) => {
    try {
        const title = req.body.title;
        const avatar = req.files["avatar"];
        const coverPhoto = req.files["coverPhoto"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupTopicId = req.body.groupTopicId;
        if (!title ||
            !avatar ||
            !coverPhoto ||
            !status ||
            !userId ||
            !groupTopicId) {
            return res.status(400).json({
                status: false,
                message: "Input required!",
            });
        }
        if (typeof title !== "string" ||
            typeof status !== "string" ||
            typeof userId !== "string" ||
            typeof groupTopicId !== "string") {
            return res.status(400).json({
                status: false,
                message: "Datatype wrong",
            });
        }
        if (!Object.values(group_enum_1.EGroupStatus).includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Status wrong",
            });
        }
        return next();
    }
    catch (_a) {
        req.flash("error", "Something went wrong!");
        return res.redirect("back");
    }
};
const groupValidate = {
    updateDescription,
    updateInvitation,
    create,
};
exports.default = groupValidate;
