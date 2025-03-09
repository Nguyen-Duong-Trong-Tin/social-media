const formChangeGroupUserRoles = document.querySelectorAll("[form-change-group-user-role]");
if (formChangeGroupUserRoles.length) {
  formChangeGroupUserRoles.forEach(form => {
    const action = form.getAttribute("action");
    const groupId = form.getAttribute("groupId");
    const userId = form.getAttribute("userId");

    const selectRole = form.querySelector("select");
    selectRole.addEventListener("change", (e) => {
      const role = e.target.value;

      form.action = `${action}/${role}/${userId}/${groupId}?_method=PATCH`;      
      form.submit();
    });
  });
}