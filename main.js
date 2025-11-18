// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Character roster storage (using localStorage - for true multi-player, use a backend)
const STORAGE_KEY = 'dnd-party-roster';

// Get roster from storage
function getRoster() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save roster to storage
function saveRoster(roster) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
}

// Render roster
function renderRoster() {
  const roster = getRoster();
  const rosterList = document.getElementById('rosterList');
  const classGrid = document.getElementById('classGrid');
  
  // Clear roster list
  if (roster.length === 0) {
    rosterList.innerHTML = '<p class="roster-empty">No characters locked in yet. Be the first!</p>';
  } else {
    rosterList.innerHTML = roster.map((character, index) => `
      <div class="roster-card" style="animation-delay: ${index * 0.1}s">
        <div class="roster-character-name">${escapeHtml(character.name)}</div>
        <div class="roster-character-class">${escapeHtml(character.class)}</div>
      </div>
    `).join('');
  }

  // Update class counts
  const classCounts = {};
  roster.forEach(char => {
    classCounts[char.class] = (classCounts[char.class] || 0) + 1;
  });

  document.querySelectorAll('.class-indicator').forEach(indicator => {
    const className = indicator.dataset.class;
    const count = classCounts[className] || 0;
    const countElement = indicator.querySelector('.class-count');
    
    if (countElement) {
      countElement.textContent = count;
      if (count > 0) {
        indicator.classList.add('has-players');
      } else {
        indicator.classList.remove('has-players');
      }
    }
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Check if user already has a character
function getUserCharacter() {
  const userId = localStorage.getItem('dnd-user-id') || generateUserId();
  localStorage.setItem('dnd-user-id', userId);
  
  const roster = getRoster();
  return roster.find(char => char.userId === userId);
}

// Generate unique user ID
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

  // Character form handling
  const characterForm = document.getElementById('characterForm');
  const existingCharacter = getUserCharacter();
  
  if (existingCharacter) {
    // Pre-fill form if user already has a character
    document.getElementById('characterName').value = existingCharacter.name;
    document.getElementById('characterClass').value = existingCharacter.class;
    document.getElementById('acceptDate').checked = true;
    
    // Update form button text
    const submitButton = characterForm.querySelector('.submit-button');
    submitButton.textContent = 'Update Character';
  }

  characterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('characterName').value.trim();
    const characterClass = document.getElementById('characterClass').value;
    const acceptDate = document.getElementById('acceptDate').checked;
    
    if (!acceptDate) {
      alert('Please accept the campaign date to continue.');
      return;
    }

    if (!name || !characterClass) {
      alert('Please fill in all fields.');
      return;
    }

    const userId = localStorage.getItem('dnd-user-id') || generateUserId();
    localStorage.setItem('dnd-user-id', userId);
    
    const roster = getRoster();
    const existingIndex = roster.findIndex(char => char.userId === userId);
    
    const character = {
      userId,
      name,
      class: characterClass,
      lockedIn: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      roster[existingIndex] = character;
    } else {
      roster.push(character);
    }

    saveRoster(roster);
    renderRoster();
    
    // Show success message
    const submitButton = characterForm.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = '✓ Locked In!';
    submitButton.style.background = '#16a34a';
    
    setTimeout(() => {
      submitButton.textContent = existingCharacter ? 'Update Character' : originalText;
      submitButton.style.background = '';
    }, 2000);
  });

  // Initial render
  renderRoster();
  
  // Auto-refresh roster every 5 seconds (for multi-player updates)
  // Note: This only works if all players use the same browser
  // For true cross-device sharing, integrate with a backend
  setInterval(() => {
    renderRoster();
  }, 5000);

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
