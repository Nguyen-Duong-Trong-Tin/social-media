import getUrlHelper from "../helpers/getUrl.helper.js";

const formSort = document.querySelector("[form-sort]");
if (formSort) {
  const select = formSort.querySelector("select[name=sort]");
  const url = getUrlHelper();
  const search = new URLSearchParams(url.search);

  select.addEventListener("change", (e) => {
    const value = e.target.value;

    if (value) {
      search.set("sort", value);
    } else {
      search.delete("sort");
    }

    window.location.href = `${url.base}?${search.toString()}`;
  });
}