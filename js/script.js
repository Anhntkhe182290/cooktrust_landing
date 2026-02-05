/* SCROLL TO SECTION */
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: "smooth"
    });
}

/* COPY HOTLINE */
function copyHotline() {
    const phone = "0965722552";
    navigator.clipboard.writeText(phone);

    const toast = document.getElementById("copy-toast");
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}

/* FOOD SLIDER ANIMATION */
let index = 0;
const items = document.querySelectorAll(".food-item");

setInterval(() => {
    items.forEach(i => i.classList.remove("active"));
    items[index].classList.add("active");

    index = (index + 1) % items.length;
}, 2500);


document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("active");

    // đổi icon
    if (nav.classList.contains("active")) {
      navToggle.textContent = "✖"; // khi mở menu
    } else {
      navToggle.textContent = "☰"; // khi đóng menu
    }
  });

  // tự động đóng menu khi click vào link
  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      navToggle.textContent = "☰";
    });
  });
});
