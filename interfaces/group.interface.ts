import { EGroupRole, EGroupStatus } from "../enums/group.enum";

interface IGroup {
  title: string;
  slug: string;
  description?: string;
  avatar: string;
  coverPhoto: string;
  status: EGroupStatus;
  users: {
    userId: string;
    role: EGroupRole;
  }[];
  userRequests: string[];
  usersInvited: string[];
  groupTopicId: string;
  deleted: boolean;
};

export default IGroup;