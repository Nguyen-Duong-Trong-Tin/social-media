const formChangeRoomChatUserRoles = document.querySelectorAll("[form-change-room-chat-user-role]");
if (formChangeRoomChatUserRoles.length) {
  formChangeRoomChatUserRoles.forEach(form => {
    const action = form.getAttribute("action");
    const roomChatId = form.getAttribute("roomChatId");
    const userId = form.getAttribute("userId");

    const selectRole = form.querySelector("select");
    selectRole.addEventListener("change", (e) => {
      const role = e.target.value;

      form.action = `${action}/${role}/${userId}/${roomChatId}?_method=PATCH`;      
      form.submit();
    });
  });
}