// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Set hero image with correct base path
  const heroImage = document.querySelector('.hero-image');
  if (heroImage) {
    heroImage.src = `${basePath}bw-image.jpg`;
  }

  // Add subtle parallax effect on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (heroImage && Math.abs(currentScroll - lastScroll) > 5) {
      const scrollOffset = currentScroll * 0.3;
      heroImage.style.transform = `translateY(${scrollOffset}px)`;
      lastScroll = currentScroll;
    }
  });
});
