function generateRandomString() {
  let randString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (randString.length < 6) {
    randString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randString;
}

const getUserByEmail = function (email, users) {
  const keys = Object.keys(users);
  for (let key of keys) {
    if (users[key].email === email) {
      return users[key];
    }
  }
};

module.exports = generateRandomString;
module.exports = getUserByEmail;
