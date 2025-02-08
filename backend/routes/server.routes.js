const express = require('express');
const { createServer } = require('../controllers/server.controller');
const authMiddleware = require('../middleware/auth.middleware'); // Ensure user is authenticated

const router = express.Router();

// Route to create a new server
router.post('/create', createServer);

module.exports = router;
