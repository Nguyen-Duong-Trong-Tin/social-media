const createInputHidden = (checkboxs) => {
  const ids = [];
  checkboxs.forEach(checkbox => ids.push(checkbox.value));

  const inputHidden = document.createElement("input");
  inputHidden.type = "hidden";
  inputHidden.name = "ids";
  inputHidden.value = ids;

  return inputHidden;
}

const checkboxAll = document.querySelector("input[name=checkbox-all]");
if (checkboxAll) {
  checkboxAll.addEventListener("change", (e) => {
    const checked = e.target.checked;

    const checkboxs = document.querySelectorAll("input[name=checkbox]");
    checkboxs.forEach(checkbox => {
      checkbox.checked = checked;
    });
  });
}

const formAction = document.querySelector("[form-action]");
if (formAction) {
  formAction.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = e.target.elements.action.value;

    const checkboxs = document.querySelectorAll("input[name=checkbox]:checked");
    if (!checkboxs.length) {
      return;
    }

    switch (value) {
      case "delete": {
        if (!window.confirm("Bạn có chắc muốn xóa?")) {
          return;
        }

        break;
      }

      case "active": { break; }
      
      case "inactive": { break; }

      default: {
        return;
      }
    }

    const inputHidden = createInputHidden(checkboxs);
    formAction.append(inputHidden);

    formAction.submit();
  });
}