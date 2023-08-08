const express = require('express');
const router = express.Router();
const twitchUserController = require('../controllers/twitch_user_controller');
const validateAccessToken = require('../authMiddleware');


router.get('/',validateAccessToken, twitchUserController.getUser);
router.post('/refreshToken',validateAccessToken, twitchUserController.refreshToken);

router.get('/recentFollowersCount',validateAccessToken, twitchUserController.getRecentFollowersCount);
router.get('/subscriptions/getSubscribersByTiers',validateAccessToken, twitchUserController.getBroadcasterSubscriptions);

router.get('/streams',validateAccessToken, twitchUserController.getStreams);
router.get('/getVideo/:id', validateAccessToken, twitchUserController.getVideo);

//broadcaster_id = user id
//if there's no moderator then write broadcaster id in moderator_id too.
router.post('/giveShoutout', validateAccessToken, twitchUserController.giveShoutout); //http://localhost:3000/api/twitch-user/giveShoutout?from_broadcaster_id=1234&to_broadcaster_id=4567&moderator_id=5678

router.post('/banUser',validateAccessToken, twitchUserController.banUser);  //http://localhost:3000/api/twitch-user/banUser?broadcaster_id=1234&moderator_id=5678 body: { "user_id": "1234", "reason": "You are banned!" }
router.post('/timeoutUser',validateAccessToken, twitchUserController.timeoutUser); //http://localhost:3000/api/twitch-user/timeoutUser?broadcaster_id=1234&moderator_id=5678 body: { "user_id": "1234", "duration": 600, "reason": "You are timed out!" }
router.delete('/unbanUser',validateAccessToken, twitchUserController.unbanUser); //http://localhost:3000/api/twitch-user/unbanUser?broadcaster_id=1234&moderator_id=5678?user_id=1234 

router.post('/create-poll',validateAccessToken, twitchUserController.createPoll);
router.patch('/end-poll',validateAccessToken, twitchUserController.endPoll);
router.get('/get-poll-by-id',validateAccessToken, twitchUserController.getPoll);
router.get('/get-polls',validateAccessToken, twitchUserController.getPolls);

router.post('/create-bet',validateAccessToken, twitchUserController.createBet);
router.patch('/end-bet',validateAccessToken, twitchUserController.endBet);
router.patch('/lock-bet',validateAccessToken, twitchUserController.lockBet);
router.get('/get-bets',validateAccessToken, twitchUserController.getBets);
router.get('/get-bet-by-id',validateAccessToken, twitchUserController.getBet);

router.post('/startRaid', validateAccessToken, twitchUserController.startRaid); //http://localhost:3000/api/twitch-user/startRaid?from_broadcaster_id=12345678&to_broadcaster_id=87654321'
router.delete('/cancelRaid', validateAccessToken, twitchUserController.cancelRaid); //http://localhost:3000/api/twitch-user/cancelRaid?broadcaster_id=12345678

module.exports = router;