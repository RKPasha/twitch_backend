const { clientId,clientSecret } = require('../config/twitch_config');
const { getRefreshToken, setAccessToken, getAccessToken } = require('../config/tokens_storage');
const { getUserId, setUserId } = require('../config/twitch_userId_storage');

class TwitchUserController {
    async getUser(req, res) {
        const accessToken = getAccessToken();

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }

        const twitchApiUrl = 'https://api.twitch.tv/helix/users';

        try {
            const response = await fetch(twitchApiUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const userData = await response.json();
            res.json(userData);
            const userId = userData.data[0].id;
            setUserId(userId);
            // Twitch.assignValue(userData.data[0].id);
        } catch (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ error: 'Failed to fetch user data from Twitch API' });
        }
    };

    async giveShoutout(req, res) {
        const fromBroadcasterId = req.query.from_broadcaster_id;
        const toBroadcasterId = req.query.to_broadcaster_id;
        const moderatorId = req.query.moderator_id;
    
        const twitchShoutoutUrl = `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${fromBroadcasterId}&to_broadcaster_id=${toBroadcasterId}&moderator_id=${moderatorId}`;
    
        try {
            const response = await fetch(twitchShoutoutUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-Id': clientId
                }
            });
    
            if (response.status === 204) {
                const responseData = await response.json();
                res.json(responseData);
            } else {
                return res.status(400).json({ error: 'Failed to perform shoutout' });
            }
        } catch (error) {
            console.error('Error performing shoutout:', error);
            return res.status(500).json({ error: 'Failed to perform shoutout' });
        }
    };

    async banUser(req, res) {
        const twitchBanUrl = 'https://api.twitch.tv/helix/moderation/bans';
        const {broadcaster_id, moderator_id} = req.query;
        const { user_id, reason } = req.body.data;
    
        try {
            const response = await fetch(twitchBanUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-Id': clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    broadcaster_id,
                    moderator_id,
                    user_id,
                    reason
                })
            });
    
            if (response.status === 204) {
                res.json({ message: 'Ban successful' });
            } else {
                return res.status(400).json({ error: 'Failed to perform ban' });
            }
        } catch (error) {
            console.error('Error performing ban:', error);
            return res.status(500).json({ error: 'Failed to perform ban' });
        }
    };

    async timeoutUser(req, res) {
        const twitchBanUrl = 'https://api.twitch.tv/helix/moderation/bans';
        const { broadcaster_id, moderator_id } = req.query;
        const { user_id, duration, reason } = req.body.data;
    
        try {
            const response = await fetch(twitchBanUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,  // Replace with your access token
                    'Client-Id': clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    broadcaster_id,
                    moderator_id,
                    user_id,
                    duration,
                    reason
                })
            });
    
            if (response.status === 204) {
                res.json({ message: 'Ban successful' });
            } else {
                return res.status(400).json({ error: 'Failed to perform ban' });
            }
        } catch (error) {
            console.error('Error performing ban:', error);
            return res.status(500).json({ error: 'Failed to perform ban' });
        }
    };

    async unbanUser(req, res){
        const twitchUnbanUrl = 'https://api.twitch.tv/helix/moderation/bans';
        const { broadcaster_id, moderator_id, user_id } = req.query;
    
        try {
            const response = await fetch(twitchUnbanUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-Id': clientId
                },
                body: JSON.stringify({
                    broadcaster_id,
                    moderator_id,
                    user_id
                })
            });
    
            if (response.status === 204) {
                res.json({ message: 'Unban successful' });
            } else {
                return res.status(response.status).json({ error: 'Failed to perform unban' });
            }
        } catch (error) {
            console.error('Error performing unban:', error);
            return res.status(500).json({ error: 'Failed to perform unban' });
        }
    };

    async refreshToken(req, res) {
        const refresh_token = getRefreshToken();
    
        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
    
        const twitchTokenUrl = 'https://id.twitch.tv/oauth2/token';
        const formData = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: clientId,
            client_secret: clientSecret
        });
    
        try {
            const response = await fetch(twitchTokenUrl, {
                method: 'POST',
                body: formData
            });
    
            if (response.ok) {
                const data = await response.json();
                setAccessToken(data.access_token);
                res.json(data);
            } else {
                return res.status(response.status).json({ error: 'Failed to refresh token' });
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            return res.status(500).json({ error: 'Failed to refresh token' });
        }
    };

    async getRecentFollowersCount(req, res){
        const userId = getUserId();
        const accessToken = getAccessToken();
    
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
    
        const twitchFollowersUrl = `https://api.twitch.tv/helix/users/follows?to_id=${userId}`;
        
        try {
            const response = await fetch(twitchFollowersUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // Replace with your access token
                    'Client-ID': clientId
                }
            });
    
            if (response.status === 200) {
                const data = await response.json();
                const followers = data.data.filter(follower => {
                    const followedDate = new Date(follower.followed_at);
                    const currentDate = new Date();
                    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return followedDate >= sevenDaysAgo;
                });
    
                const followerCount = followers.length;
    
                res.json({ followerCount });
            } else {
                return res.status(400).json({ error: 'Failed to fetch followers' });
            }
        } catch (error) {
            console.error('Error fetching followers:', error);
            return res.status(500).json({ error: 'Failed to fetch followers' });
        }
    };

    async getBroadcasterSubscriptions(req, res){
        const broadcasterId = getUserId();
        const accessToken = getAccessToken();
    
        if (!broadcasterId) {
            return res.status(400).json({ error: 'Broadcaster ID is required' });
        }
    
        const twitchSubscriptionsUrl = `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterId}`;
        
        try {
            const response = await fetch(twitchSubscriptionsUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // Replace with your access token
                    'Client-ID': clientId
                }
            });
    
            if (response.status === 200) {
                const data = await response.json();
    
                const tier1Users = [];
                const tier2Users = [];
                const tier3Users = [];
    
                data.data.forEach(subscription => {
                    if (subscription.tier === '1000') {
                        tier1Users.push(subscription);
                    } else if (subscription.tier === '2000') {
                        tier2Users.push(subscription);
                    } else if (subscription.tier === '3000') {
                        tier3Users.push(subscription);
                    }
                });
    
                res.json({
                    tier1Users,
                    tier2Users,
                    tier3Users
                });
            } else {
                return res.status(400).json({ error: 'Failed to fetch subscriptions' });
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            return res.status(500).json({ error: 'Failed to fetch subscriptions' });
        }
    };

    async getStreams(req, res) {
        const twitchStreamsUrl = 'https://api.twitch.tv/helix/streams';
        
        try {
            const response = await fetch(twitchStreamsUrl, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`, // Replace with your access token
                    'Client-ID': clientId
                }
            });
    
            if (response.status === 200) {
                const data = await response.json();
                const liveStreams = data.data.filter(stream => stream.type === 'live');
            res.json(liveStreams);
            } else {
                return res.status(400).json({ error: 'Failed to fetch streams' });
            }
        } catch (error) {
            console.error('Error fetching streams:', error);
            return res.status(500).json({ error: 'Failed to fetch streams' });
        }
    };

    async getVideo(req, res) {
        const videoId = req.params.id;
        const twitchVideosUrl = `https://api.twitch.tv/helix/videos?id=${videoId}`;
        
        try {
            const response = await fetch(twitchVideosUrl, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,  // Replace with your access token
                    'Client-ID': clientId
                }
            });
    
            if (response.status === 200) {
                const data = await response.json();
                if (data.data.length > 0) {
                    res.json(data.data[0]);
                } else {
                    res.status(404).json({ error: 'Video not found' });
                }
            } else {
                return res.status(400).json({ error: 'Failed to fetch video details' });
            }
        } catch (error) {
            console.error('Error fetching video details:', error);
            return res.status(500).json({ error: 'Failed to fetch video details' });
        }
    };

    async createPoll(req, res) {
        const accessToken = getAccessToken();
        const broadcasterId = getUserId();
        const { title, choices, duration } = req.body;
        console.log(broadcasterId);

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }

        const twitchApiUrl = 'https://api.twitch.tv/helix/polls';

        try {
            const response = await fetch(twitchApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    broadcaster_id: broadcasterId,
                    title: title,
                    choices: choices,
                    duration: duration
                })
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create poll' });
        }
    }

    async endPoll(req, res) {
        const broadcasterId = getUserId();
        const pollId = req.query.id;
        const status = req.query.status; // "TERMINATED" or "ARCHIVED"

        if (!broadcasterId || !pollId || !status) {
            return res.status(400).json({ error: 'Broadcaster ID, poll ID, and status are required' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/polls?broadcaster_id=${broadcasterId}&id=${pollId}&status=${status}`;

        try {
            const response = await fetch(twitchApiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            console.error('Error updating poll status:', error);
            res.status(500).json({ error: 'Failed to update poll status' });
        }
    }

    async getPoll(req, res) {
        const broadcasterId = getUserId();
        const pollId = req.query.id;

        if (!broadcasterId || !pollId) {
            return res.status(400).json({ error: 'Broadcaster ID and poll ID are required' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/polls?broadcaster_id=${broadcasterId}&id=${pollId}`;

        try {
            const response = await fetch(twitchApiUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            console.error('Error fetching poll details:', error);
            res.status(500).json({ error: 'Failed to fetch poll details' });
        }
    }

    async getPolls(req, res) {
        const accessToken = getAccessToken();
        const broadcasterId = getUserId();

        if (!broadcasterId) {
            return res.status(400).json({ error: 'Broadcaster ID is required' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/polls?broadcaster_id=${broadcasterId}`;

        try {
            const response = await fetch(twitchApiUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            console.error('Error fetching polls:', error);
            res.status(500).json({ error: 'Failed to fetch polls' });
        }
    }

    async createBet(req, res) {
        const broadcaster_id = getUserId();
        const accessToken = getAccessToken();

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }
        if (!broadcaster_id) {
            return res.status(401).json({ error: 'Broadcaster id missing' });
        }

        const { title, outcomes, prediction_window } = req.body;


        if (!title || !outcomes || !prediction_window) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const twitchApiUrl = 'https://api.twitch.tv/helix/predictions';

        try {
            const response = await fetch(twitchApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    broadcaster_id: broadcaster_id,
                    title: title,
                    outcomes: outcomes,
                    prediction_window: prediction_window
                })
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create prediction' });
        }
    }

    async endBet(req, res) {
        const broadcaster_id = getUserId();
        const accessToken = getAccessToken();

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }

        if (!broadcaster_id) {
            return res.status(401).json({ error: 'Broadcaster id missing' });
        }
        //Set the status query parameter to RESOLVED.
        // Set the winning_outcome_id query parameter to the ID of the winning outcome. Each Outcome object contains an id field.
        const { id, status, winning_outcome_id } = req.query;


        if (!id || !status || !winning_outcome_id) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcaster_id}&id=${id}&status=${status}&winning_outcome_id=${winning_outcome_id}`;

        try {
            const response = await fetch(twitchApiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update prediction status' });
        }
    }

    async lockBet(req, res) {
        const broadcasterId = getUserId();
        const accessToken = getAccessToken();

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }
        if (!broadcasterId) {
            return res.status(401).json({ error: 'Broadcaster id missing' });
        }

        const { id, status } = req.query; // Set the status query parameter to CANCELED or LOCKED.


        if (!id || !status) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcasterId}&id=${id}&status=${status}`;

        try {
            const response = await fetch(twitchApiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to cancel prediction' });
        }
    }

    async getBets(req, res) {
        const broadcaster_id = getUserId();
        const accessToken = getAccessToken();

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }

        if (!broadcaster_id) {
            return res.status(400).json({ error: 'Broadcaster ID missing' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcaster_id}`;

        try {
            const response = await fetch(twitchApiUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch predictions' });
        }
    }

    async getBet(req, res) {
        const broadcaster_id = getUserId();
        const accessToken = getAccessToken();

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' });
        }

        if (!broadcaster_id) {
            return res.status(400).json({ error: 'Broadcaster ID missing' });
        }

        const id  = req.query.id;

        if ( !id) {
            return res.status(400).json({ error: 'Bet ID is required' });
        }

        const twitchApiUrl = `https://api.twitch.tv/helix/predictions?broadcaster_id=${broadcaster_id}&id=${id}`;

        try {
            const response = await fetch(twitchApiUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            });

            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch prediction by ID' });
        }
    }

    async startRaid(req, res) {
        const fromBroadcasterId = req.query.from_broadcaster_id;
        const toBroadcasterId = req.query.to_broadcaster_id;
    
        const twitchRaidUrl = `https://api.twitch.tv/helix/raids?from_broadcaster_id=${fromBroadcasterId}&to_broadcaster_id=${toBroadcasterId}`;
    
        try {
            const response = await fetch(twitchRaidUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,// Replace with your access token
                    'Client-Id': clientId
                }
            });
    
            if (response.status === 200) {
                const responseData = await response.json();
                res.json(responseData);
            } else {
                return res.status(400).json({ error: 'Failed to perform raid' });
            }
        } catch (error) {
            console.error('Error performing raid:', error);
            return res.status(500).json({ error: 'Failed to perform raid' });
        }
    }

    async cancelRaid(req, res) {
        const broadcasterId = req.query.broadcaster_id;
    
        const twitchCancelRaidUrl = `https://api.twitch.tv/helix/raids?broadcaster_id=${broadcasterId}`;
    
        try {
            const response = await fetch(twitchCancelRaidUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`,// Replace with your access token
                    'Client-Id': clientId
                }
            });
    
            if (response.status === 204) {
                res.json({ message: 'Raid canceled successfully' });
            } else {
                return res.status(400).json({ error: 'Failed to cancel raid' });
            }
        } catch (error) {
            console.error('Error canceling raid:', error);
            return res.status(500).json({ error: 'Failed to cancel raid' });
        }
    };
}

module.exports = new TwitchUserController();
