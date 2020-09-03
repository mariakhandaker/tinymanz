const bcrypt = require('bcrypt');

const doesUserExist = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {;
      return database[user];
    }
  }
  return undefined;
}

const letUserLogin = (email, password) => {
  const user = doesUserExist(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      return user;
    }
  }
  return false;
};

// const letUserLogin = (email, password) => {
  
//   let user = doesUserExist(email, users);
//   if (user) {
//     if (user.email === email && user.password === password) {
//       return true;
//     } else {
//       return false;
//     }
//   }
// };


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};

module.exports = { doesUserExist, letUserLogin, urlsForUser, users, urlDatabase };