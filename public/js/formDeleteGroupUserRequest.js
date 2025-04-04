const formDeleteGroupUserRequests = document.querySelectorAll("[form-delete-group-user-request]");
if (formDeleteGroupUserRequests.length) {
  formDeleteGroupUserRequests.forEach(form => {
    const action = form.getAttribute("action");
    const groupId = form.getAttribute("groupId");
    const userId = form.getAttribute("userId");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (confirm("Bạn có chắc muốn xóa?")) {
        form.action = `${action}/${userId}/${groupId}?_method=DELETE`;
        form.submit();
      }
    });
  });
}