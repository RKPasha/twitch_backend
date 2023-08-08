const fetch = require('node-fetch');
const { getAccessToken } = require('./config/tokens_storage');

async function validateAccessToken(req, res, next) {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return res.redirect('http://localhost:3000');
  }

  const response = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      'Authorization': `OAuth ${accessToken}`,
    }
  });


  if (response.status === 401) {
    return res.redirect('http://localhost:3000');
  }

  next();
}

module.exports = validateAccessToken;
