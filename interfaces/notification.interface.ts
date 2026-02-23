import ENotificationType from "../enums/notification.enum";

interface INotification {
  userId: string;
  type: ENotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  deleted: boolean;
}

export default INotification;
