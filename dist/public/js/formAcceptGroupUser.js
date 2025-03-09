const formAcceptGroupUsers = document.querySelectorAll("[form-accept-group-user]");
if (formAcceptGroupUsers.length) {
  formAcceptGroupUsers.forEach(form => {
    const action = form.getAttribute("action");
    const groupId = form.getAttribute("groupId");
    const userId = form.getAttribute("userId");
    
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      form.action = `${action}/${userId}/${groupId}?_method=PATCH`;
      form.submit();
    });
  });
}