export interface ClientSendMessageToAIAssistantDto {
  userId: string;
  message: string;
  groupId: string;
};

export interface ClientSendMessageToRoomChatDto {
  userId: string;
  roomChatId: string;
  content?: string;
  images?: string[];
  videos?: string[];
  materials?: string[];
};

export interface ClientTogglePinMessageDto {
  userId: string;
  roomChatId: string;
  messageId: string;
  pinned: boolean;
};

export interface ClientTypingToRoomChatDto {
  userId: string;
  roomChatId: string;
  isTyping: boolean;
};

export interface ServerResponseMessageToRoomChatDto {
  _id?: string;
  userId: string;
  roomChatId: string;
  content: string;
  images?: string[];
  videos?: string[];
  materials?: string[];
  pinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: string | null;
  createdAt?: string;
};

export interface ServerResponsePinMessageDto {
  userId: string;
  roomChatId: string;
  messageId: string;
  pinned: boolean;
  pinnedBy?: string;
  pinnedAt?: string | null;
};

export interface ServerResponseTypingToRoomChatDto {
  userId: string;
  roomChatId: string;
  isTyping: boolean;
};