const getUserByEmail = function (email, users) {
  const keys = Object.keys(users);
  for (let key of keys) {
    if (users[key].email === email) {
      return users[key];
    }
  }
};

module.exports = { getUserByEmail };
