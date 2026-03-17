interface IMessage {
  _id?: string;
  content?: string;
  images?: string[];
  videos?: string[];
  materials?: string[];
  userId?: string;
  roomChatId: string;
  pinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: Date | string | null;
  deleted?: boolean;
}

export default IMessage;