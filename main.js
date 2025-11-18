// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Set CSS custom properties for image paths BEFORE DOM elements are accessed
// This ensures the styles are set before CSS loads
document.documentElement.style.setProperty('--base-path', `url("${basePath}color-image.jpg")`);
document.documentElement.style.setProperty('--mask-path', `url("${basePath}image-mask.png")`);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.querySelector(".reset-animation");
  const maskedImage = document.querySelector(".color-image");

  // Also set styles directly on the element as a backup
  maskedImage.style.backgroundImage = `url("${basePath}color-image.jpg")`;
  maskedImage.style.webkitMaskImage = `url("${basePath}image-mask.png")`;
  maskedImage.style.maskImage = `url("${basePath}image-mask.png")`;

  // Apply animation on page load
  maskedImage.classList.add("mask-animation");

  resetButton.addEventListener("click", () => {
    maskedImage.classList.remove("mask-animation");
    setTimeout(() => maskedImage.classList.add("mask-animation"), 100);
  });
});
