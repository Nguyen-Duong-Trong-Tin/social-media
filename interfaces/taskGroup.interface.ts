import { ETaskGroupStatus } from "../enums/taskGroup.enum";

interface ITaskGroup {
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  status: ETaskGroupStatus;
  groupId: string;
  createdBy: {
    userId: string;
    createdAt: Date;
  };
  deleted: boolean;
}

export default ITaskGroup;
