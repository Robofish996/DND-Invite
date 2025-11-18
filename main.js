// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Set hero image with correct base path
  const heroImage = document.querySelector('.hero-image');
  if (heroImage) {
    heroImage.src = `${basePath}3e536af8f1b31e98489c5800fe9af5da.jpg`;
  }

  // Set details section image
  const detailsImage = document.querySelector('.details-image');
  if (detailsImage) {
    detailsImage.src = `${basePath}363d3b735ab0afee1216dfe8f1368e4f.jpg`;
  }

  // Smooth scroll to details section
  const ctaButton = document.querySelector('.cta-button');
  const detailsSection = document.querySelector('.details-section');

  if (ctaButton && detailsSection) {
    ctaButton.addEventListener('click', () => {
      detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Add subtle parallax effect on scroll
  let lastScroll = 0;
  const heroSection = document.querySelector('.hero-section');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (heroImage && heroSection) {
      const heroHeight = heroSection.offsetHeight;
      if (currentScroll < heroHeight) {
        const scrollOffset = currentScroll * 0.5;
        heroImage.style.transform = `translateY(${scrollOffset}px) scale(1.05)`;
      }
    }
    lastScroll = currentScroll;
  });
});
