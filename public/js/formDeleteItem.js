const formsDeleteItem = document.querySelectorAll("[form-delete-item]");
if (formsDeleteItem) {
  formsDeleteItem.forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (window.confirm("Bạn có chắc muốn xóa?")) {
        form.submit();
      }
    });
  });
}