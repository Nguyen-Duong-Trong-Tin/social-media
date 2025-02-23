const formPermission = document.querySelector("[form-permission]");
if (formPermission) {
  const createInput = (role) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = role.id;
    input.value = role.permissions;

    return input;
  }

  const roles = JSON.parse(formPermission.getAttribute("roles"));

  formPermission.addEventListener("submit", (e) => {
    e.preventDefault();

    const checkboxs = document.querySelectorAll("input[type=checkbox]:checked");
    checkboxs.forEach(checkbox => {
      const roleId = checkbox.getAttribute("roleId");
      const value = checkbox.getAttribute("value");

      const index = roles.findIndex(role => role.id === roleId);
      roles[index].permissions.push(value);
    });

    roles.forEach(role => {
      const input = createInput(role);
      formPermission.appendChild(input);
    });

    formPermission.submit();
  });
}