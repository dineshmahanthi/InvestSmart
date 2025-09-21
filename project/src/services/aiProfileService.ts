// AI Profile Avatar Service
// This service provides random AI-generated avatars for user profiles

// Define the image object structure
export interface AvatarImage {
  id: string;
  url: string;
  alt: string;
}

// Collection of avatar styles available from DiceBear API
const AVATAR_STYLES = [
  'avataaars',  // Human avatars with customizable features
  'bottts',     // Robot-style avatars
  'pixel-art',  // Pixelated style avatars
  'lorelei',    // Hand-drawn style avatars
  'micah',      // Simple, minimal avatars
  'personas',   // Abstract human figures
  'identicon'   // Abstract geometric patterns
];

// Generate a random seed for uniqueness
function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Create a collection of random avatars
function generateRandomAvatars(count: number = 12): AvatarImage[] {
  const avatars: AvatarImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const seed = generateRandomSeed();
    
    avatars.push({
      id: `avatar-${i+1}`,
      url: `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`,
      alt: `Random avatar ${i+1}`
    });
  }
  
  return avatars;
}

// Pregenerate a set of random avatars
const randomAvatars = generateRandomAvatars(12);

/**
 * Gets a collection of random avatars
 * @param count Number of random avatars to generate
 */
export function getRandomAvatars(count: number = 12): AvatarImage[] {
  return generateRandomAvatars(count);
}

/**
 * Gets the pregenerated set of random avatars
 */
export function getAvatars(): AvatarImage[] {
  return randomAvatars;
}

/**
 * Gets a single random avatar
 */
export function getRandomAvatar(): AvatarImage {
  const randomIndex = Math.floor(Math.random() * randomAvatars.length);
  return randomAvatars[randomIndex];
}

/**
 * Generates a fresh random avatar with a new seed
 */
export function generateFreshAvatar(): AvatarImage {
  const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = generateRandomSeed();
  
  return {
    id: `avatar-fresh-${seed}`,
    url: `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`,
    alt: `Random avatar`
  };
}