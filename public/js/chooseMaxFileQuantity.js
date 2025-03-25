const inputs = document.querySelectorAll("input[chooseMaxFileQuantity]");
if (inputs.length) {
  inputs.forEach(input => {
    const maxFileQuantity = parseInt(input.getAttribute("chooseMaxFileQuantity"));

    input.addEventListener("change", (e) => {
      if (e.target.files.length > maxFileQuantity) {
        window.alert("Chỉ chọn tối đa 6 tập tin!");
        e.target.value = "";

        return;
      }
    });
  });
}