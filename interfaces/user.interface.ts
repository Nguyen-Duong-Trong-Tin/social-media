import { EUserOnline, EUserStatus } from "../enums/user.enum";

interface IUser {
  fullName: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  status: EUserStatus;
  coverPhoto: string;
  bio: string;
  friends: {
    userId: string,
    roomChatId: string
  }[],
  acceptFriends: string[];
  requestFriends: string[];
  online: EUserOnline;
  deleted: boolean;
};

export default IUser;