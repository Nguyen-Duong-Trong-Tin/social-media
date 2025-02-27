import EUserStatus from "../enums/user.enum";

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
  deleted: boolean;
};

export default IUser;