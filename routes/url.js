const express = require('express');
const router = express.Router();
const { generateShortCode, isValidUrl } = require('../utils/shortcode');
const db = require('../db/dynamodb');

/**
 * POST /api/shorten
 * Create a shortened URL
 */
router.post('/shorten', async (req, res) => {
  const { url } = req.body;

  // Validate input
  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      success: false 
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ 
      error: 'Invalid URL format. Must include http:// or https://',
      success: false 
    });
  }

  // Generate unique short code and retry if collision
  let shortCode;
  let attempts = 0;
  const maxAttempts = 10;
  let result;

  do {
    shortCode = generateShortCode();
    result = await db.createUrl(shortCode, url);
    attempts++;
  } while (!result.success && attempts < maxAttempts);

  if (!result.success) {
    return res.status(500).json({ 
      error: 'Failed to generate unique short code',
      success: false 
    });
  }

  // Return shortened URL
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const shortUrl = `${baseUrl}/${shortCode}`;

  res.status(201).json({
    success: true,
    shortCode,
    shortUrl,
    originalUrl: url
  });
});

/**
 * GET /api/stats/:shortCode
 * Get statistics for a short URL
 */
router.get('/stats/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  const result = await db.getUrl(shortCode);

  if (!result.success) {
    return res.status(404).json({ 
      error: result.error,
      success: false 
    });
  }

  res.json({
    success: true,
    shortCode,
    ...result.data
  });
});

/**
 * GET /api/all
 * Get all URLs (for debugging)
 */
router.get('/all', async (req, res) => {
  const result = await db.getAllUrls();

  res.json({
    success: result.success,
    count: result.count,
    urls: result.data
  });
});

module.exports = { router };
