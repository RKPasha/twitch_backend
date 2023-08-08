const express = require('express');
const fetch = require('node-fetch');
const twitchUserRoutes = require('./routes/twitch_user_routes'); // Require the user routes module
const botRoutes = require('./routes/bot_routes'); // Require the bot routes module
const streamerRoutes = require('./routes/streamer_routes'); // Require the streamer routes module
const userRoutes = require('./routes/user_routes'); // Require the user routes module
const eventsubRoutes = require('./routes/eventsub_routes'); // Require the eventsub routes module
const connectionPool = require('./config/connect_db'); // Require the connection pool module
const { setRefreshToken, setAccessToken } = require('./config/tokens_storage');
const app = express();
const port = 3000;

const { clientId, clientSecret } = require('./config/twitch_config.js'); // Require the client id and secret for Twitch

const redirectUri = "http://localhost:3000/auth/twitch/callback";

// Use the user routes module for all routes starting with /api/user
app.use(express.json());
app.use('/api/twitch-user', twitchUserRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/streamer', streamerRoutes);
app.use('/api/eventsub', eventsubRoutes);
// Redirect user to Twitch authorization URL
app.get('/', (req, res) => {
  const authorizeUrl = `https://id.twitch.tv/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=channel%3Amanage%3Apredictions+channel%3Aread%3Apredictions+channel%3Amanage%3Apolls+channel%3Aread%3Apolls+channel%3Aread%3Asubscriptions+moderator%3Amanage%3Abanned_users+moderator%3Amanage%3Ashoutouts` +
    `&state=some_random_state`;

  res.send(`<a href="${authorizeUrl}">Connect with Twitch</a>`);
});

// Handle Twitch callback
app.get('/auth/twitch/callback', async (req, res) => {
  const { code, state } = req.query;

  const url = 'https://id.twitch.tv/oauth2/token';
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: body
    });

    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    // Redirect to a page that uses the API endpoint and pass the access token as a query parameter
    res.redirect(`/api/twitch-user?access_token=${accessToken}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to obtain access token' });
  }
});

// Check the database connection
connectionPool.getConnection(function (err, connection) {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }

  console.log('Connected to the database as id ' + connection.threadId);

  // Release the connection
  connection.release();

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

});