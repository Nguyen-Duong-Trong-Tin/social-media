import { EArticleGroupStatus } from "../enums/articleGroup.enum";

interface IArticleGroup {
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  status: EArticleGroupStatus;
  groupId: string;
  createdBy: {
    userId: string;
    createdAt: Date;
  };
  likes?: {
    userId: string;
    createdAt: Date;
  }[];
  comments?: {
    _id?: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  deleted: boolean;
}

export default IArticleGroup;
