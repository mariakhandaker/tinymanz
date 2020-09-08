const bcrypt = require('bcrypt');
const { users, urlDatabase } = require('./databases');

//shortURL and userID generator function
const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

//scans database to find if email exists, returns user if so
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

//verifies login using helper function + bcrypt, returns user if true
const letUserLogin = (email, password) => {
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

//finds URLS assiciated with logged in user and returns them for templating 
const urlsForUser = (id) => {
  const userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = { longURL: urlDatabase[url].longURL };
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByEmail, letUserLogin, urlsForUser, users, urlDatabase };