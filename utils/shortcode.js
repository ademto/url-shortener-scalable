/**
 * Generate a random short code for URLs
 * @param {number} length - Length of the short code (default: 6)
 * @returns {string} Random alphanumeric short code
 */
function generateShortCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortCode += characters[randomIndex];
  }
  
  return shortCode;
}

/**
 * Validate if a URL is properly formatted
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateShortCode,
  isValidUrl
};
