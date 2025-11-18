// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Firebase configuration
// TODO: Replace with your Firebase config
// Get this from Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (with fallback to localStorage if not configured)
let firebaseInitialized = false;
let database = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    firebaseInitialized = true;
    console.log("Firebase initialized - using shared database");
  } else {
    console.warn("Firebase not configured - using localStorage (data won't be shared across devices)");
  }
} catch (error) {
  console.warn("Firebase initialization failed - using localStorage:", error);
}

// Fallback to localStorage if Firebase not configured
const STORAGE_KEY = 'dnd-party-roster';

// Get roster from storage (Firebase or localStorage)
function getRoster() {
  if (firebaseInitialized && database) {
    // Firebase will handle this via listeners
    return [];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save roster to storage (Firebase or localStorage)
function saveRoster(roster) {
  if (firebaseInitialized && database) {
    database.ref('roster').set(roster);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
  }
}

// Render roster from data
function renderRosterFromData(roster) {
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

// Render roster (gets data first)
function renderRoster() {
  const roster = getRoster();
  renderRosterFromData(roster);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Check if user already has a character
async function getUserCharacter() {
  const userId = localStorage.getItem('dnd-user-id') || generateUserId();
  localStorage.setItem('dnd-user-id', userId);
  
  let roster = [];
  if (firebaseInitialized && database) {
    // Get from Firebase
    const snapshot = await database.ref('roster').once('value');
    const data = snapshot.val();
    roster = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
  } else {
    roster = getRoster();
  }
  
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
  
  // Load existing character (async)
  getUserCharacter().then(existingCharacter => {
    if (existingCharacter) {
      // Pre-fill form if user already has a character
      document.getElementById('characterName').value = existingCharacter.name;
      document.getElementById('characterClass').value = existingCharacter.class;
      document.getElementById('acceptDate').checked = true;
      
      // Update form button text
      const submitButton = characterForm.querySelector('.submit-button');
      submitButton.textContent = 'Update Character';
    }
  });

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
    
    const character = {
      userId,
      name,
      class: characterClass,
      lockedIn: new Date().toISOString()
    };

    if (firebaseInitialized && database) {
      // Get current roster from Firebase
      database.ref('roster').once('value', (snapshot) => {
        const data = snapshot.val();
        let roster = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        
        const existingIndex = roster.findIndex(char => char.userId === userId);
        
        if (existingIndex >= 0) {
          roster[existingIndex] = character;
        } else {
          roster.push(character);
        }
        
        saveRoster(roster);
        // renderRoster will be called automatically by Firebase listener
      });
    } else {
      // Use localStorage
      const roster = getRoster();
      const existingIndex = roster.findIndex(char => char.userId === userId);
      
      if (existingIndex >= 0) {
        roster[existingIndex] = character;
      } else {
        roster.push(character);
      }
      
      saveRoster(roster);
      renderRoster();
    }
    
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

  // Reset button handling
  const resetButton = document.getElementById('resetRoster');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all character data? This cannot be undone.')) {
        if (firebaseInitialized && database) {
          database.ref('roster').set([]);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        localStorage.removeItem('dnd-user-id');
        renderRoster();
        
        // Clear form
        characterForm.reset();
        const submitButton = characterForm.querySelector('.submit-button');
        submitButton.textContent = 'Lock In Character';
        
        // Show confirmation
        resetButton.textContent = '✓ Reset!';
        resetButton.style.background = '#16a34a';
        resetButton.style.borderColor = '#16a34a';
        resetButton.style.color = '#ffffff';
        
        setTimeout(() => {
          resetButton.textContent = 'Reset';
          resetButton.style.background = '';
          resetButton.style.borderColor = '';
          resetButton.style.color = '';
        }, 2000);
      }
    });
  }

  // Set up Firebase real-time listener or fallback
  if (firebaseInitialized && database) {
    // Real-time listener for Firebase
    database.ref('roster').on('value', (snapshot) => {
      const roster = snapshot.val() || [];
      renderRosterFromData(Array.isArray(roster) ? roster : Object.values(roster));
    });
  } else {
    // Fallback: Initial render and periodic refresh for localStorage
    renderRoster();
    setInterval(() => {
      renderRoster();
    }, 5000);
  }

  // Initial render
  renderRoster();

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
