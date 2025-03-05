enum ERoomChatType {
  friend = "friend",
  group = "group"
};

enum ERoomChatStatus {
  active = "active",
  inactive = "inactive"
};

enum ERoomChatRole {
  superAdmin = "superAdmin",
  admin = "admin",
  user = "user"
};

export {
  ERoomChatType,
  ERoomChatStatus,
  ERoomChatRole
};