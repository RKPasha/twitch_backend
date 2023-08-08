let refreshToken = '';
let accessToken = '';
module.exports = {
  getRefreshToken() {
    return refreshToken;
  },
  getAccessToken() {
    return accessToken;
  },
  setRefreshToken(token) {
    refreshToken = token;
  },
  setAccessToken(token) {
    accessToken = token;
  }
};