function getCurrentYear() {
  const now = new Date();

  document.getElementById("current-year").innerText = now.getFullYear();
};

getCurrentYear();