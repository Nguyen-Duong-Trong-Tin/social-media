export interface ClientAcceptFriendRequestDto {
  userId: string;
  userRequestId: string;
}

export interface ClientRejectFriendRequestDto {
  userId: string;
  userRequestId: string;
}

export interface ClientDeleteFriendAcceptDto {
  userId: string;
  userRequestId: string;
}