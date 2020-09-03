const doesUserExist = (email, database) => {
  for (let user in database) {
    if (user["email"] === email) {
      return user;
    }
  }
  return false;
};

const letUserLogin = (email, password) => {
  for (let user in users) {
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (let url in urlDatabase) {
    if (url.userID === id) {
      userURLs[url] = { longURL: urlDatabase[url].longURL };
    }
  }
  return userURLs;
};

module.exports = { doesUserExist, letUserLogin, urlsForUser };