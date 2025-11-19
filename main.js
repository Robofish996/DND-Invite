// Set base path for images (Vite replaces import.meta.env.BASE_URL during build)
const basePath = import.meta.env.BASE_URL;

// Supabase configuration
const SUPABASE_URL = "https://fetqossfmyfoflswpyob.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldHFvc3NmbXlmb2Zsc3dweW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MDE1NjksImV4cCI6MjA3OTA3NzU2OX0.eK0jaYHyRMuzWITk8K8F-Y91p68CFW8Oql5Gustupq0";

// Initialize Supabase (with fallback to localStorage if not configured)
let supabaseClient = null;
let supabaseInitialized = false;

try {
  if (SUPABASE_URL && SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseInitialized = true;
    console.log("Supabase initialized - using shared database");
  } else {
    console.warn("Supabase not configured - using localStorage (data won't be shared across devices)");
  }
} catch (error) {
  console.warn("Supabase initialization failed - using localStorage:", error);
}

// Fallback to localStorage if Supabase not configured
const STORAGE_KEY = 'dnd-party-roster';

// Get roster from storage (Supabase or localStorage)
async function getRoster() {
  if (supabaseInitialized && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('roster')
      .select('*')
      .order('locked_in', { ascending: true });
    
    if (error) {
      console.error('Error fetching roster:', error);
      return [];
    }
    return data || [];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save character to storage (Supabase or localStorage)
async function saveCharacter(character) {
  if (supabaseInitialized && supabaseClient) {
    // Check if character exists
    const { data: existing } = await supabaseClient
      .from('roster')
      .select('*')
      .eq('user_id', character.userId)
      .single();
    
    if (existing) {
      // Update existing
      const { error } = await supabaseClient
        .from('roster')
        .update({
          player_name: character.playerName,
          name: character.name,
          class: character.class,
          locked_in: character.lockedIn
        })
        .eq('user_id', character.userId);
      
      if (error) {
        console.error('Error updating character:', error);
        return false;
      }
    } else {
      // Insert new
      const { error } = await supabaseClient
        .from('roster')
        .insert({
          user_id: character.userId,
          player_name: character.playerName,
          name: character.name,
          class: character.class,
          locked_in: character.lockedIn
        });
      
      if (error) {
        console.error('Error inserting character:', error);
        return false;
      }
    }
    return true;
  } else {
    // Use localStorage
    const roster = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const existingIndex = roster.findIndex(char => char.userId === character.userId);
    
    if (existingIndex >= 0) {
      roster[existingIndex] = character;
    } else {
      roster.push(character);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
    return true;
  }
}

// Delete all roster (for reset)
async function clearRoster() {
  if (supabaseInitialized && supabaseClient) {
    const { error } = await supabaseClient
      .from('roster')
      .delete()
      .neq('user_id', ''); // Delete all
    
    if (error) {
      console.error('Error clearing roster:', error);
      return false;
    }
    return true;
  } else {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }
}

// Render roster from data
function renderRosterFromData(roster) {
  const rosterList = document.getElementById('rosterList');
  const classGrid = document.getElementById('classGrid');
  
  // Normalize data (handle both userId and user_id, and playerName/player_name)
  const normalizedRoster = roster.map(char => ({
    userId: char.userId || char.user_id,
    playerName: char.playerName || char.player_name || '',
    name: char.name,
    class: char.class
  }));
  
  // Clear roster list
  if (normalizedRoster.length === 0) {
    rosterList.innerHTML = '<p class="roster-empty">No characters locked in yet. Be the first!</p>';
  } else {
    rosterList.innerHTML = normalizedRoster.map((character, index) => `
      <div class="roster-card" style="animation-delay: ${index * 0.1}s">
        <div class="roster-player-name">${escapeHtml(character.playerName)}</div>
        <div class="roster-character-name">${escapeHtml(character.name)}</div>
        <div class="roster-character-class">${escapeHtml(character.class)}</div>
      </div>
    `).join('');
  }

  // Update class counts
  const classCounts = {};
  normalizedRoster.forEach(char => {
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
async function renderRoster() {
  const roster = await getRoster();
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
  
  const roster = await getRoster();
  return roster.find(char => char.userId === userId || char.user_id === userId);
}

// Generate unique user ID
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Text randomization reveal animation
function revealText(element, targetText, options = {}) {
  const {
    speed = 15, // milliseconds between updates
    randomness = 0.7, // probability of showing random char vs revealing (0-1)
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
    iterations = 3 // number of random passes before revealing each char
  } = options;

  const textLength = targetText.length;
  let revealed = Array(textLength).fill(false);
  let currentText = Array(textLength).fill(' ');
  let iteration = 0;

  function getRandomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  function update() {
    let allRevealed = true;

    for (let i = 0; i < textLength; i++) {
      if (revealed[i]) {
        currentText[i] = targetText[i];
      } else {
        allRevealed = false;
        
        // For each character, do a few random iterations, then reveal it
        const charIteration = Math.floor(iteration / textLength);
        
        if (charIteration >= iterations && Math.random() > randomness) {
          revealed[i] = true;
          currentText[i] = targetText[i];
        } else {
          // Show random character
          if (targetText[i] === ' ') {
            currentText[i] = ' ';
          } else {
            currentText[i] = getRandomChar();
          }
        }
      }
    }

    element.textContent = currentText.join('');

    if (!allRevealed) {
      iteration++;
      setTimeout(update, speed);
    } else {
      // Ensure final text is correct
      element.textContent = targetText;
    }
  }

  // Start with all spaces or random chars
  for (let i = 0; i < textLength; i++) {
    if (targetText[i] === ' ') {
      currentText[i] = ' ';
    } else {
      currentText[i] = getRandomChar();
    }
  }
  element.textContent = currentText.join('');

  // Start animation after a brief delay
  setTimeout(update, 100);
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
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

  // Text reveal animation for hero section
  const titleLines = document.querySelectorAll('.title-line');
  titleLines.forEach((line, index) => {
    const targetText = line.textContent;
    line.textContent = ''; // Clear initial text
    setTimeout(() => {
      revealText(line, targetText, {
        speed: 40,
        randomness: 0.75,
        iterations: 2
      });
    }, index * 800); // Stagger each line
  });

  const heroDescription = document.querySelector('.hero-description');
  if (heroDescription) {
    const targetText = heroDescription.textContent;
    heroDescription.textContent = ''; // Clear initial text
    setTimeout(() => {
      revealText(heroDescription, targetText, {
        speed: 25,
        randomness: 0.8,
        iterations: 1
      });
    }, 2000); // Start after title lines
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
  let existingCharacter = null;
  getUserCharacter().then(char => {
    existingCharacter = char;
    if (existingCharacter) {
      // Pre-fill form if user already has a character
      if (existingCharacter.playerName) {
        document.getElementById('playerName').value = existingCharacter.playerName;
      }
      document.getElementById('characterName').value = existingCharacter.name;
      document.getElementById('characterClass').value = existingCharacter.class;
      document.getElementById('acceptDate').checked = true;
      
      // Update form button text
      const submitButton = characterForm.querySelector('.submit-button');
      submitButton.textContent = 'Update Character';
    }
  });

  characterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const playerName = document.getElementById('playerName').value.trim();
    const name = document.getElementById('characterName').value.trim();
    const characterClass = document.getElementById('characterClass').value;
    const acceptDate = document.getElementById('acceptDate').checked;
    
    if (!acceptDate) {
      alert('Please accept the campaign date to continue.');
      return;
    }

    if (!playerName || !name || !characterClass) {
      alert('Please fill in all fields.');
      return;
    }

    const userId = localStorage.getItem('dnd-user-id') || generateUserId();
    localStorage.setItem('dnd-user-id', userId);
    
    const character = {
      userId,
      playerName,
      name,
      class: characterClass,
      lockedIn: new Date().toISOString()
    };

    const success = await saveCharacter(character);
    
    if (success) {
      // Always refresh roster immediately for instant feedback
      await renderRoster();
      
      // Show success message
      const submitButton = characterForm.querySelector('.submit-button');
      const originalText = submitButton.textContent;
      const hadExistingCharacter = !!existingCharacter;
      
      submitButton.textContent = '✓ Locked In!';
      submitButton.style.background = '#16a34a';
      
      setTimeout(() => {
        submitButton.textContent = hadExistingCharacter ? 'Update Character' : originalText;
        submitButton.style.background = '';
      }, 2000);
    } else {
      alert('Failed to save character. Please try again.');
      return;
    }
  });

  // Countdown timer to November 29, 2025 12:00 SAST (UTC+2)
  const targetDate = new Date('2025-11-29T12:00:00+02:00'); // South Africa Standard Time
  const countdownElement = document.getElementById('countdown');
  
  function updateCountdown() {
    const now = new Date();
    const difference = targetDate - now;
    
    if (difference <= 0) {
      countdownElement.textContent = 'TIME UP!';
      return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  
  // Update countdown immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Set up Supabase real-time listener or fallback
  if (supabaseInitialized && supabaseClient) {
    // Real-time listener for Supabase
    supabaseClient
      .channel('roster-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'roster' },
        () => {
          // Reload roster when changes occur
          renderRoster();
        }
      )
      .subscribe();
    
    // Initial render
    await renderRoster();
  } else {
    // Fallback: Initial render and periodic refresh for localStorage
    await renderRoster();
    setInterval(async () => {
      await renderRoster();
    }, 5000);
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
