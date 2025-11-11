import { ETaskGroupSubmissionStatus } from "../enums/taskGroupSubmission.enum";

interface ITaskGroupSubmission {
  title: string;
  slug: string;
  description: string;
  images: string[];
  videos: string[];
  materials: string[];
  status: ETaskGroupSubmissionStatus;
  taskGroupId: string;
  createdBy: {
    userId: string;
    createdAt: Date;
  };
  deleted: boolean;
}

export default ITaskGroupSubmission;
