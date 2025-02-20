import getUrlHelper from "../helpers/getUrl.helper.js";

const formsUpdateStatus = document.querySelectorAll("[form-update-status]");
if (formsUpdateStatus.length) {
  const { base } = getUrlHelper();

  formsUpdateStatus.forEach(form => {
    const id = form.getAttribute("id")
    const select = form.querySelector("select[name=status]");

    select.addEventListener("change", (e) => {
      const value = e.target.value;

      form.action = `${base}/updateStatus/${value}/${id}?_method=PATCH`;
      form.submit();
    });
  });
}