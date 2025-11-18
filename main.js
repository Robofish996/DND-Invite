// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.querySelector(".reset-animation");
  const maskedImage = document.querySelector(".color-image");

  if (!maskedImage) {
    console.error("Could not find .color-image element");
    return;
  }

  // Build image URLs with correct base path
  const colorImageUrl = `${basePath}color-image.jpg`;
  const maskImageUrl = `${basePath}image-mask.png`;

  console.log("Setting images with base path:", basePath);
  console.log("Color image URL:", colorImageUrl);
  console.log("Mask image URL:", maskImageUrl);

  // Set image paths directly on the element using setProperty for better browser support
  // These must be set via JavaScript to work with GitHub Pages base path
  maskedImage.style.setProperty('background-image', `url("${colorImageUrl}")`, 'important');
  maskedImage.style.setProperty('-webkit-mask-image', `url("${maskImageUrl}")`, 'important');
  maskedImage.style.setProperty('mask-image', `url("${maskImageUrl}")`, 'important');

  // Verify styles were applied
  console.log("Background image:", maskedImage.style.backgroundImage);
  console.log("Mask image:", maskedImage.style.webkitMaskImage);

  // Apply animation on page load
  maskedImage.classList.add("mask-animation");

  resetButton.addEventListener("click", () => {
    maskedImage.classList.remove("mask-animation");
    setTimeout(() => maskedImage.classList.add("mask-animation"), 100);
  });
});
