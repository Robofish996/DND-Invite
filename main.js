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
  
  // Normalize data (handle both userId and user_id)
  const normalizedRoster = roster.map(char => ({
    userId: char.userId || char.user_id,
    name: char.name,
    class: char.class
  }));
  
  // Clear roster list
  if (normalizedRoster.length === 0) {
    rosterList.innerHTML = '<p class="roster-empty">No characters locked in yet. Be the first!</p>';
  } else {
    rosterList.innerHTML = normalizedRoster.map((character, index) => `
      <div class="roster-card" style="animation-delay: ${index * 0.1}s">
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

  characterForm.addEventListener('submit', async (e) => {
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

    const success = await saveCharacter(character);
    
    if (success) {
      // If using Supabase, the real-time listener will update automatically
      // Otherwise, manually refresh
      if (!supabaseInitialized) {
        await renderRoster();
      }
    } else {
      alert('Failed to save character. Please try again.');
      return;
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
    resetButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all character data? This cannot be undone.')) {
        const success = await clearRoster();
        
        if (success) {
          localStorage.removeItem('dnd-user-id');
          await renderRoster();
          
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
        } else {
          alert('Failed to reset roster. Please try again.');
        }
      }
    });
  }

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
