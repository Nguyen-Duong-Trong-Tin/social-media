const buttonGoBack = document.querySelector("[button-go-back]");
if (buttonGoBack) {
  buttonGoBack.addEventListener("click", () => {
    const href = buttonGoBack.getAttribute("href");
    if (href) {
      window.location.href = href;
      return;
    }
    
    window.history.back();
  });
}