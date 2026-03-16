import { Request, Response } from "express";

import {
  ERoomChatRole,
  ERoomChatStatus,
  ERoomChatType,
} from "../../enums/roomChat.enum";
import roomChatService from "../../services/client/roomChat.service";
import groupService from "../../services/client/group.service";
import { EGroupRole } from "../../enums/group.enum";
import slugUtil from "../../utils/slug.util";
import shortUniqueKeyUtil from "../../utils/shortUniqueKey.util";

const mapGroupRoleToRoomChatRole = (role?: EGroupRole) => {
  if (role === EGroupRole.superAdmin) return ERoomChatRole.superAdmin;
  if (role === EGroupRole.admin) return ERoomChatRole.admin;
  return ERoomChatRole.user;
};

const buildRoomChatUsers = (
  users: { userId?: string | null; role?: EGroupRole }[]
) => {
  return users
    .filter((user) => typeof user.userId === "string" && user.userId.trim())
    .map((user) => ({
      userId: user.userId as string,
      role: mapGroupRoleToRoomChatRole(user.role),
    }));
};

const sortRoomChatUsers = (
  users: { userId: string; role: ERoomChatRole }[]
) => {
  return [...users].sort((a, b) => a.userId.localeCompare(b.userId));
};

// GET /v1/roomChats/ai-assistant/:groupId/:userId
const findByAiAssistantAndUserId = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    const roomChatExists = await roomChatService.findOne({
      filter: {
        users: {
          $all: [
            { $elemMatch: { userId: userId } },
            { $elemMatch: { userId: groupId } },
          ],
        },
        type: ERoomChatType.friend,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Room chat found",
      data: roomChatExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/roomChats/group/:groupId/:userId
const findByGroupId = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;

    const groupExists = await groupService.findOne({
      filter: { _id: groupId },
    });

    if (!groupExists) {
      return res.status(404).json({
        status: false,
        message: "Group id not found",
      });
    }

    const isMember = (groupExists.users || []).some(
      (user) => user.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({
        status: false,
        message: "You are not a member of this group",
      });
    }

    const nextUsers = buildRoomChatUsers(groupExists.users || []);

    let roomChatExists = await roomChatService.findOne({
      filter: {
        groupId,
        type: ERoomChatType.group,
      },
    });

    if (!roomChatExists) {
      const title = `${groupExists.title} room`;
      const slug: string =
        slugUtil.convert(title) + "-" + shortUniqueKeyUtil.generate();

      roomChatExists = await roomChatService.create({
        doc: {
          title,
          slug,
          type: ERoomChatType.group,
          avatar: groupExists.avatar,
          groupId,
          status: ERoomChatStatus.active,
          users: nextUsers,
          userRequests: [],
        },
      });
    } else {
      const currentUsers = sortRoomChatUsers(
        (roomChatExists.users || []) as { userId: string; role: ERoomChatRole }[]
      );
      const normalizedNextUsers = sortRoomChatUsers(nextUsers);

      if (
        JSON.stringify(currentUsers) !== JSON.stringify(normalizedNextUsers)
      ) {
        roomChatExists = await roomChatService.findOneAndUpdate({
          filter: { _id: roomChatExists._id },
          update: { users: normalizedNextUsers, avatar: groupExists.avatar },
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Room chat found",
      data: roomChatExists,
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

// GET /v1/roomChats/user/:userId
const findByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const roomChats = await roomChatService.find({
      filter: {
        users: { $elemMatch: { userId } },
        status: ERoomChatStatus.active,
      },
      sort: { updatedAt: -1 },
      limit: 100,
    });

    return res.status(200).json({
      status: true,
      message: "Room chats found",
      data: {
        roomChats,
      },
    });
  } catch {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const roomChatController = {
  findByAiAssistantAndUserId,
  findByGroupId,
  findByUserId,
};
export default roomChatController;