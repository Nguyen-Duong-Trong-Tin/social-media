import getUrlHelper from "../helpers/getUrl.helper.js";

const formFilter = document.querySelector("[form-filter]");
if (formFilter) {
  const filter = formFilter.querySelector("select[name=filter]");
  const url = getUrlHelper();
  const search = new URLSearchParams(url.search);

  filter.addEventListener("change", (e) => {
    const value = e.target.value;

    if (value) {
      search.set("filter", value);
    } else {
      search.delete("filter");
    }

    window.location.href = `${url.base}?${search.toString()}`;
  });
}