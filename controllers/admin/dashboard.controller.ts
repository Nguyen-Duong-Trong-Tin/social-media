import { Response } from "express";

import UserModel from "../../models/user.model";
import GroupModel from "../../models/group.model";
import ArticleUserModel from "../../models/articleUser.model";
import ArticleGroupModel from "../../models/articleGroup.model";
import RoomChatModel from "../../models/roomChat.model";
import TaskGroupModel from "../../models/taskGroup.model";
import TaskGroupSubmissionModel from "../../models/taskGroupSubmission.model";

// [GET] /admin/dashboard
const get = async (req: any, res: Response): Promise<void> => {
  try {
    const [
      users,
      groups,
      articleUsers,
      articleGroups,
      roomChats,
      taskGroups,
      taskGroupSubmissions,
    ] = await Promise.all([
      UserModel.countDocuments({ deleted: false }),
      GroupModel.countDocuments({ deleted: false }),
      ArticleUserModel.countDocuments({ deleted: false }),
      ArticleGroupModel.countDocuments({ deleted: false }),
      RoomChatModel.countDocuments({ deleted: false }),
      TaskGroupModel.countDocuments({ deleted: false }),
      TaskGroupSubmissionModel.countDocuments({ deleted: false }),
    ]);

    const stats = {
      users,
      groups,
      articleUsers,
      articleGroups,
      roomChats,
      taskGroups,
      taskGroupSubmissions,
    };
    console.log(stats);

    return res.render("admin/pages/dashboard", {
      pageTitle: "Dashboard",
      stats: {
        users,
        groups,
        articleUsers,
        articleGroups,
        roomChats,
        taskGroups,
        taskGroupSubmissions,
      },
    });
  } catch {
    req.flash("error", "Something went wrong!");
    return res.redirect("back");
  }
};

const dashboardController = {
  get,
};
export default dashboardController;
