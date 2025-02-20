import getUrlHelper from "../helpers/getUrl.helper.js";

const formSeach = document.querySelector("[form-search]");
if (formSeach) {
  const url = getUrlHelper();
  const search = new URLSearchParams(url.search);

  formSeach.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = e.target.elements.keyword.value;
    if (value) {
      search.set("keyword", value);
    } else {
      search.delete("keyword");
    }

    window.location.href = `${url.base}?${search.toString()}`;
  });
}