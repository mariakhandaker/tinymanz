const doesUserExist = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      // console.log(database[user].email);
      // console.log(database[user]);
      return database[user];
    }
  }
  // return false;
}

const letUserLogin = (email, password, database) => {
  
  // for (let user in database) {
  //   if (database[user].email === email && database[user].password === password) {
  //     return true;
  //   }
  // }
  // return false;
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
    if (url.userID === id) {
      userURLs[url] = { longURL: urlDatabase[url].longURL };
    }
  }
  return userURLs;
};

module.exports = { doesUserExist, letUserLogin, urlsForUser };