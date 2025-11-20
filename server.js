require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: urlRouter } = require('./routes/url');
const db = require('./db/dynamodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check endpoint (for ALB)
app.get('/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  
  res.status(dbHealth.success ? 200 : 503).json({ 
    status: dbHealth.success ? 'healthy' : 'unhealthy',
    database: dbHealth.success ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', urlRouter);

// Redirect endpoint - must come after API routes
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  const result = await db.getUrl(shortCode);

  if (!result.success) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  // Increment click counter (async, don't wait)
  db.incrementClicks(shortCode).catch(err => console.error('Failed to increment clicks:', err));

  // Redirect to original URL
  res.redirect(result.data.originalUrl);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Shortener running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});
