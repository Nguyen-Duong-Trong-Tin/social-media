import { EUserOnline, EUserStatus } from "../enums/user.enum";

interface IUser {
  fullName: string;
  slug: string;
  email: string;
  password: string;
  phone?: string;
  avatar: string;
  status: EUserStatus;
  coverPhoto: string;
  bio: string;
  lastLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  locationVisibility?: "friends" | "everyone";
  authProvider: "local" | "google";
  googleId?: string;
  friends: {
    userId: string;
    roomChatId: string;
  }[];
  friendAccepts: string[];
  friendRequests: string[];
  online: EUserOnline;
  deleted: boolean;
}

export default IUser;
