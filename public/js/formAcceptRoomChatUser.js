const formAcceptRoomChatUsers = document.querySelectorAll("[form-accept-room-chat-user]");
if (formAcceptRoomChatUsers.length) {
  formAcceptRoomChatUsers.forEach(form => {
    const action = form.getAttribute("action");
    const roomChatId = form.getAttribute("roomChatId");
    const userId = form.getAttribute("userId");
    
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      form.action = `${action}/${userId}/${roomChatId}?_method=PATCH`;
      form.submit();
    });
  });
}