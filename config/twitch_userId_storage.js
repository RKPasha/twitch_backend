let user_id = '';

module.exports = {
  getUserId() {
    return user_id;
  },
  setUserId(userId) {
    user_id = userId;
  }
};