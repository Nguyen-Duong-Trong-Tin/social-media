import { ERoomChatRole, ERoomChatStatus, ERoomChatType } from "../enums/roomChat.enum";

interface IRoomChat {
  title: string;
  slug: string;
  type: ERoomChatType;
  avatar: string;
  status: ERoomChatStatus;
  users: {
    userId: string;
    role: ERoomChatRole;
  }[];
  userRequests: string[];
  deleted: boolean;
};

export default IRoomChat;