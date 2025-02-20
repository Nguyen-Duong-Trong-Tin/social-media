const tinymceTextarea = document.querySelector("[tinymce]");
if (tinymceTextarea) {
  const readonly = tinymceTextarea.getAttribute("readonly");

  tinymce.init({
    selector: "[tinymce]",
    readonly: readonly !== null
  });
}