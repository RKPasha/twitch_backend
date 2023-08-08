const express = require('express');
const router = express.Router();

const botController = require('../controllers/bot_controller');

// Get all bots
router.get('/', botController.getBots);
router.get('/getBotById/:id', botController.getBotById);
router.post('/addBot', botController.addBot);
router.patch('/editBot/:id', botController.editBot);
router.delete('/deleteBot/:id', botController.deleteBot);

module.exports = router;