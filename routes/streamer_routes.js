const express = require('express');
const router = express.Router();

const streamerController = require('../controllers/streamer_controller');

// Get all streamers
router.get('/', streamerController.getStreamers);
router.get('/getStreamerById/:id', streamerController.getStreamerById);
router.delete('/deleteStreamer/:id', streamerController.deleteStreamer);
router.post('/addStreamer', streamerController.addStreamer);
router.patch('/editStreamer/:id', streamerController.editStreamer);

module.exports = router;