const flash = document.querySelector(".flash");
if (flash) {
  setTimeout(() => {
    flash.style.display = "none";
  }, 3000);

  flash.addEventListener("click", () => {
    flash.style.display = "none";
  });
}