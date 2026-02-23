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

export interface ClientTypingToRoomChatDto {
  userId: string;
  roomChatId: string;
  isTyping: boolean;
};

export interface ServerResponseMessageToRoomChatDto {
  userId: string;
  roomChatId: string;
  content: string;
  images?: string[];
  videos?: string[];
  materials?: string[];
  createdAt?: string;
};

export interface ServerResponseTypingToRoomChatDto {
  userId: string;
  roomChatId: string;
  isTyping: boolean;
};