import { RootFilterQuery } from "mongoose";
import { Request, Response } from "express";

import slugUtil from "../../utils/slug.util";
import GroupModel from "../../models/group.model";
import sortHelper from "../../helpers/sort.helper";
import sendMailHelper from "../../helpers/sendMail.helper";
import userService from "../../services/client/user.service";
import paginationHelper from "../../helpers/pagination.helper";
import groupService from "../../services/client/group.service";
import { EGroupRole, EGroupStatus } from "../../enums/group.enum";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";
import groupTopicService from "../../services/client/groupTopic.service";

// GET /v1/groups?sort&page&limit&filter
const find = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    const sort = sortHelper(req);
    const pagination = paginationHelper(req);
    const filterOptions: RootFilterQuery<typeof GroupModel> = {};

    if (filter) {
      const { title, slug, description, status, userId, groupTopicId } =
        JSON.parse(filter);

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

    const [total, items] = await Promise.all([
      groupService.countDocuments({ filter: filterOptions }),
      groupService.find({
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
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/groups/:id
const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const groupExists = await groupService.findOne({ filter: { _id: id } });
    if (!groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Group found",
      data: groupExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/groups/slug/:slug
const findBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const groupExists = await groupService.findOne({ filter: { slug } });
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
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/groups/suggesst/:userId
const findSuggest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userExists = await userService.findOne({ filter: { _id: userId } });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const w1 = 0.7;
    const w2 = 0.3;

    const userGroups = await groupService.find({
      filter: { "users.userId": userId },
    });

    const userGroupIds = new Set(userGroups.map((userGroup) => userGroup.id));
    const userTopicIds = new Set(
      userGroups.map((userGroup) => userGroup.groupTopicId)
    );

    const allGroups = await groupService.find({ filter: {} });

    const groupIdToMemberCount = new Map<string, number>();
    for (const allGroup of allGroups) {
      const usersArray = Array.isArray(allGroup.users) ? allGroup.users : [];
      groupIdToMemberCount.set(allGroup.id, usersArray.length);
    }

    const maxMember = Math.max(0, ...Array.from(groupIdToMemberCount.values()));

    const norm = (x: number, max: number) => (max > 0 ? x / max : 0);

    const suggestions = allGroups
      .map((group) => {
        const groupId = group.id;
        if (userGroupIds.has(groupId)) return null;

        const memberCount = groupIdToMemberCount.get(groupId) ?? 0;
        const topicMatchFlag =
          group.groupTopicId && userTopicIds.has(group.groupTopicId) ? 1 : 0;
        const normMember = norm(memberCount, maxMember);

        const score = w1 * topicMatchFlag + w2 * normMember;

        const reason = topicMatchFlag
          ? "Same topic as groups you joined"
          : memberCount > 0
          ? "Popular group"
          : "Small / new group";

        return {
          groupId,
          title: group.title,
          slug: group.slug,
          description: group.description,
          avatar: group.avatar,
          coverPhoto: group.coverPhoto,
          groupTopicId: group.groupTopicId,
          status: group.status,
          memberCount,
          topicMatchFlag,
          normMember,
          score,
          reason,
          createdAt: group.createdAt,
        };
      })
      .filter(Boolean) as Array<any>;

    suggestions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.memberCount ?? 0) !== (a.memberCount ?? 0))
        return (b.memberCount ?? 0) - (a.memberCount ?? 0);
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.status(200).json({
      status: true,
      message: "Group suggesstion found",
      userId,
      weights: { w1, w2 },
      suggestions,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/groups/description/:id
const updateDescription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const groupExists = await groupService.findOneAndUpdate({
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/groups/invitation/:id
const updateInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { invitation } = req.body;

    const groupExists = await groupService.findOneAndUpdate({
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// PATCH /v1/groups/change-user-role/:role/:userId/:id
const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { role, userId, id } = req.params;

    const [groupExists, userExists] = await Promise.all([
      groupService.findOne({ filter: { _id: id } }),
      userService.findOne({ filter: { _id: userId } }),
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

    const newGroup = await groupService.findOneAndUpdate({
      filter: { _id: id, "users.userId": userId },
      update: { $set: { "users.$.role": role } },
    });

    return res.status(200).json({
      status: true,
      message: "Update successfully",
      data: newGroup,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/groups
const create = async (req: any, res: Response) => {
  try {
    const title: string = req.body.title;
    const slug: string =
      slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();
    const description: string = req.body.description;
    const avatar: string = req.files["avatar"][0].path;
    const coverPhoto: string = req.files["coverPhoto"][0].path;
    const status: EGroupStatus = req.body.status;
    const userId: string = req.body.userId;
    const groupTopicId: string = req.body.groupTopicId;

    const [groupSlugExists, userExists, groupTopicExists] = await Promise.all([
      groupService.findOne({ filter: { slug } }),
      userService.findOne({ filter: { _id: userId } }),
      groupTopicService.findOne({ filter: { _id: groupTopicId } }),
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

    const users: {
      userId: string;
      role: EGroupRole;
    }[] = [{ userId, role: EGroupRole.superAdmin }];
    const newGroup = await groupService.create({
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/groups/invite-member/:userId/:id
const inviteMember = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params;

    const userExists = await userService.findOne({ filter: { _id: userId } });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const groupExists = await groupService.findOneAndUpdate({
      filter: { _id: id },
      update: { $addToSet: { usersInvited: userId } },
    });
    if (!groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    sendMailHelper({
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/groups/invite-member/accept/:userId/:id
const inviteMemberAccept = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params;

    const userExists = await userService.findOne({ filter: { _id: userId } });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const groupExists = await groupService.findOne({ filter: { _id: id } });
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

    const newGroup = await groupService.findOneAndUpdate({
      filter: { _id: id },
      update: {
        $pull: { usersInvited: userId },
        $push: { users: { userId, role: EGroupRole.user } },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Update successfully",
      data: newGroup,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// POST /v1/groups/invite-member/reject/:userId/:id
const inviteMemberReject = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params;

    const userExists = await userService.findOne({ filter: { _id: userId } });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const groupExists = await groupService.findOneAndUpdate({
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// DELETE /v1/groups/leave/:userId/:id
const leaveGroup = async (req: Request, res: Response) => {
  try {
    console.log("ok");
    const { userId, id } = req.params;

    const userExists = await userService.findOne({ filter: { _id: userId } });
    if (!userExists) {
      return res.status(404).json({
        status: false,
        message: "User id not found",
      });
    }

    const groupExists = await groupService.findOneAndUpdate({
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const groupController = {
  find,
  findById,
  findBySlug,
  findSuggest,
  updateDescription,
  updateInvitation,
  changeUserRole,
  create,
  inviteMember,
  inviteMemberAccept,
  inviteMemberReject,
  leaveGroup,
};
export default groupController;
