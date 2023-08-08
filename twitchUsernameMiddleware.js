const fetch = require('node-fetch');
const { clientId } = require('./config/twitch_config'); // Import your Twitch client ID
const { setUserId } = require('./config/twitch_userId_storage');

async function validateTwitchUsername(req, res, next) {
    const username = req.body.username;
    const accessToken = req.query.access_token;


    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const twitchUsernameCheckUrl = `https://api.twitch.tv/helix/users?login=${username}`;

    try {
        const response = await fetch(twitchUsernameCheckUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Client-ID': clientId
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            if (data.data[0] === undefined) {
                return res.status(400).json({ error: 'Invalid Twitch username' });
            } else {
                const userId = data.data[0].id;
                setUserId(userId);
                next(); // Username is valid, proceed to the next middleware or route handler
            }
        } else {
            return res.status(400).json({ error: 'Invalid Twitch username' });
        }
    } catch (error) {
        console.error('Error checking Twitch username:', error);
        return res.status(500).json({ error: 'Failed to check Twitch username' });
    }
}

module.exports = validateTwitchUsername;
