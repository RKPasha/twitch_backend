const { clientId, clientSecret } = require('../config/twitch_config');
const { getAccessToken } = require('../config/tokens_storage');

class EventSubController {

    async getSubscriptions(req, res){
        const twitchEventSubUrl = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    
        try {
            const response = await fetch(twitchEventSubUrl, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-Id': clientId
                }
            });
    
            if (response.status === 200) {
                const responseData = await response.json();
                res.json(responseData);
            } else {
                return res.status(400).json({ error: 'Failed to fetch EventSub subscriptions' });
            }
        } catch (error) {
            console.error('Error fetching EventSub subscriptions:', error);
            return res.status(500).json({ error: 'Failed to fetch EventSub subscriptions' });
        }
    };

    async subscribeCreateShoutoutsNotification(req, res) {
        const { broadcaster_id, moderator_id } = req.query;
        if (!broadcaster_id || !moderator_id) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }
        const twitchEventSubUrl = 'https://api.twitch.tv/helix/eventsub/subscriptions';

        const requestBody = {
            "type": "channel.shoutout.create",
            "version": "1",
            "condition": {
                "broadcaster_user_id": broadcaster_id,
                "moderator_user_id": moderator_id
            },
            "transport": {
                "method": "webhook",
                // "callback": "http://localhost:3000/webhooks/callback",
                "secret": "s3cRe78s9fg8"
            }
        };

        try {
            const response = await fetch(twitchEventSubUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-Id': clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 202) {
                const responseData = await response.json();
                res.json(responseData);
            } else {
                const responseData = await response.json();
                console.log(responseData);
                return res.status(400).json({ error: 'Failed to create EventSub subscription' });
            }
        } catch (error) {
            console.error('Error creating EventSub subscription:', error);
            return res.status(500).json({ error: 'Failed to create EventSub subscription' });
        }
    };

    async subscribeReceiveShoutoutsNotification(req, res) {
        const { broadcaster_id, moderator_id } = req.query;
        if (!broadcaster_id || !moderator_id) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }
        const twitchEventSubUrl = 'https://api.twitch.tv/helix/eventsub/subscriptions';

        const requestBody = {
            "type": "channel.shoutout.receive",
            "version": "1",
            "condition": {
                "broadcaster_user_id": broadcaster_id,
                "moderator_user_id": moderator_id
            },
            "transport": {
                "method": "webhook",
                // "callback": "http://localhost:3000/webhooks/callback",
                "secret": "s3cRe78s9fg8"
            }
        };

        try {
            const response = await fetch(twitchEventSubUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-Id': clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 202) {
                const responseData = await response.json();
                res.json(responseData);
            } else {
                return res.status(400).json({ error: 'Failed to create EventSub subscription' });
            }
        } catch (error) {
            console.error('Error creating EventSub subscription:', error);
            return res.status(500).json({ error: 'Failed to create EventSub subscription' });
        }
    };
}
module.exports = new EventSubController();