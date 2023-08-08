const express = require('express');
const router = express.Router();
const eventSubController = require('../controllers/eventsub_controller');
const validateAccessToken = require('../authMiddleware');

router.get('/', validateAccessToken, eventSubController.getSubscriptions);
router.post('/subscribeCreateShoutoutsNotification',validateAccessToken, eventSubController.subscribeCreateShoutoutsNotification);
router.post('/subscribeReceiveShoutoutsNotification',validateAccessToken, eventSubController.subscribeReceiveShoutoutsNotification);

module.exports = router;
