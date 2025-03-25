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
  },
  deleted: boolean;
};

export default IArticleGroup;