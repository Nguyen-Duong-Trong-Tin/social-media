import { EArticleUserStatus } from "../enums/articleUser.enum";

interface IArticleUser {
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  status: EArticleUserStatus;
  createdBy: {
    userId: string;
    createdAt: Date;
  },
  deleted: boolean;
};

export default IArticleUser;