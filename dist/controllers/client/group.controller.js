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
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const sendMail_helper_1 = __importDefault(require("../../helpers/sendMail.helper"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const group_enum_1 = require("../../enums/group.enum");
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const groupTopic_service_1 = __importDefault(require("../../services/client/groupTopic.service"));
// GET /v1/groups?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { title, slug, description, status, userId, groupTopicId } = JSON.parse(filter);
            if (title) {
                filterOptions.title = new RegExp(title, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (description) {
                filterOptions.description = new RegExp(description, "i");
            }
            if (status) {
                filterOptions.status = status;
            }
            if (userId) {
                filterOptions["users.userId"] = userId;
            }
            if (groupTopicId) {
                filterOptions.groupTopicId = groupTopicId;
            }
        }
        const [total, items] = yield Promise.all([
            group_service_1.default.countDocuments({ filter: filterOptions }),
            group_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Groups found",
            data: {
                groups: {
                    total,
                    page: pagination.page,
                    limit: pagination.limit,
                    items,
                },
            },
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/groups/slug/:slug
const findBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const groupExists = yield group_service_1.default.findOne({ filter: { slug } });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Groups found",
            data: groupExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/groups/description/:id
const updateDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const groupExists = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { description },
        });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: groupExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/groups/invitation/:id
const updateInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { invitation } = req.body;
        const groupExists = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { invitation },
        });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: groupExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/groups/change-user-role/:role/:userId/:id
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, userId, id } = req.params;
        const [groupExists, userExists] = yield Promise.all([
            group_service_1.default.findOne({ filter: { _id: id } }),
            user_service_1.default.findOne({ filter: { _id: userId } }),
        ]);
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        if (!groupExists.users.some((user) => user.userId === userId)) {
            return res.status(400).json({
                status: false,
                message: "User not in this group",
            });
        }
        const newGroup = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id, "users.userId": userId },
            update: { $set: { "users.$.role": role } },
        });
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: newGroup,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/groups
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const avatar = req.files["avatar"][0].path;
        const coverPhoto = req.files["coverPhoto"][0].path;
        const status = req.body.status;
        const userId = req.body.userId;
        const groupTopicId = req.body.groupTopicId;
        const [groupSlugExists, userExists, groupTopicExists] = yield Promise.all([
            group_service_1.default.findOne({ filter: { slug } }),
            user_service_1.default.findOne({ filter: { _id: userId } }),
            groupTopic_service_1.default.findOne({ filter: { _id: groupTopicId } }),
        ]);
        if (groupSlugExists) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong. Please try again!",
            });
        }
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        if (!groupTopicExists) {
            return res.status(404).json({
                status: false,
                message: "Group topic id not found",
            });
        }
        const users = [{ userId, role: group_enum_1.EGroupRole.superAdmin }];
        const newGroup = yield group_service_1.default.create({
            doc: {
                title,
                slug,
                description,
                avatar,
                coverPhoto,
                status,
                users,
                userRequests: [],
                groupTopicId,
                deleted: false,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Create successfully",
            data: newGroup,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/groups/invite-member/:userId/:id
const inviteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, id } = req.params;
        const userExists = yield user_service_1.default.findOne({ filter: { _id: userId } });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const groupExists = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { $addToSet: { usersInvited: userId } },
        });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        (0, sendMail_helper_1.default)({
            email: userExists.email,
            subject: `Invitation to join group ${groupExists.title}`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f9fa; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img src="${groupExists.coverPhoto}" alt="Group Cover" style="width: 100%; height: auto;">
            <div style="padding: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 90px; vertical-align: middle;">
                    <img
                      src="${groupExists.avatar}"
                      alt="Group Avatar"
                      style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"
                    />
                  </td>
                  <td style="vertical-align: middle;">
                    <h2 style="margin: 0; color: #007BFF;">${groupExists.title}</h2>
                  </td>
                </tr>
              </table>

              <p style="margin-top: 15px;">
                You are invited to join the <strong>${groupExists.title}</strong> group — a community for learning and sharing about 
                <strong>NodeJS programming</strong>.
              </p>

              <div style="margin-top: 20px; font-size: 15px; line-height: 1.6;">
                ${groupExists.invitation}
              </div>

              <div style="text-align: center; margin-top: 25px;">
                <a href="http://localhost:5173/group-profile/view-invitation/${groupExists.slug}"
                  style="background-color: #28a745; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  See Invitation
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #555;">
                If you didn’t request this invitation, you can safely ignore this email.
              </p>
            </div>
            <div style="background-color: #f1f3f5; text-align: center; padding: 10px; font-size: 13px; color: #777;">
              © 2025 NodeJS Community. All rights reserved.
            </div>
          </div>
        </div>
        `,
        });
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: groupExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/groups/invite-member/accept/:userId/:id
const inviteMemberAccept = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, id } = req.params;
        const userExists = yield user_service_1.default.findOne({ filter: { _id: userId } });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const groupExists = yield group_service_1.default.findOne({ filter: { _id: id } });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        const isInvited = groupExists.usersInvited.includes(userId);
        if (!isInvited) {
            return res.status(400).json({
                status: false,
                message: "User id not in the invited list",
            });
        }
        const newGroup = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: {
                $pull: { usersInvited: userId },
                $push: { users: { userId, role: group_enum_1.EGroupRole.user } },
            },
        });
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: newGroup,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/groups/invite-member/reject/:userId/:id
const inviteMemberReject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, id } = req.params;
        const userExists = yield user_service_1.default.findOne({ filter: { _id: userId } });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const groupExists = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id, usersInvited: userId },
            update: { $pull: { usersInvited: userId } },
        });
        if (!groupExists) {
            return res.status(400).json({
                status: false,
                message: "Group id not found or user not in invited list",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: groupExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// DELETE /v1/groups/leave/:userId/:id
const leaveGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("ok");
        const { userId, id } = req.params;
        const userExists = yield user_service_1.default.findOne({ filter: { _id: userId } });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const groupExists = yield group_service_1.default.findOneAndUpdate({
            filter: { _id: id, "users.userId": userId },
            update: { $pull: { users: { userId } } },
        });
        if (!groupExists) {
            return res.status(400).json({
                status: false,
                message: "Group id not found or user not in this group",
            });
        }
        return res.status(200).json({
            status: false,
            message: "Leave successfully",
            data: groupExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const groupController = {
    find,
    findBySlug,
    updateDescription,
    updateInvitation,
    changeUserRole,
    create,
    inviteMember,
    inviteMemberAccept,
    inviteMemberReject,
    leaveGroup,
};
exports.default = groupController;
