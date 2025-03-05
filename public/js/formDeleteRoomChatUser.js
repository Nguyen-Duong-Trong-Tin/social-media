const formDeleteRoomChatUsers = document.querySelectorAll("[form-delete-room-chat-user]");
if (formDeleteRoomChatUsers) {
  formDeleteRoomChatUsers.forEach(form => {
    const action = form.getAttribute("action");
    const roomChatId = form.getAttribute("roomChatId");
    const userId = form.getAttribute("userId");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (confirm("Bạn có chắc muốn xóa?")) {
        form.action = `${action}/${userId}/${roomChatId}?_method=DELETE`;
        form.submit();
      }
    });
  });
}