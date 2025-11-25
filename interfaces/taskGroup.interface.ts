import { ETaskGroupStatus } from "../enums/taskGroup.enum";

interface ITaskGroup {
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  status: ETaskGroupStatus;
  groupId: string;
  score?: number;
  comment?: string;
  scoredBy: string;
  createdBy: {
    userId: string;
    createdAt: Date;
  };
  deadline: Date;
  deleted: boolean;
}

export default ITaskGroup;
