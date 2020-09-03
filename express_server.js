//app setup + middlewares
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const { doesUserExist, letUserLogin, urlsForUser } = require('./helpers');

//setting middlewares for use
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.set("view engine", "ejs");

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
//function declarations
const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

//GET routes
//homepage when logged in, shows url index
app.get("/urls", (req, res) => {;
  let templateVars = {
    shortURL: req.params.shortURL, 
    database: urlDatabase,
    user: req.cookies.user_id,
    users: users
  };
  if (req.cookies.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.cookies.user_id,
    users: users,
  };
  res.render("urls_new", templateVars);
});

//redirect to long URL after editing
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    users: users,
    user: req.cookies.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.cookies.user_id,
    urls: urlDatabase,
    users: users,
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    users: users,
    user: req.cookies.user_id,
    urls: urlDatabase,
  };
  res.render("urls_login", templateVars);
});

//POST routes
//generate short URL and store it in databse
app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL,
      userID: req.cookies.user_id
    };
    res.redirect("/urls/" + shortURL);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies.user_id]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.cookies.user_id]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls/");
  } else {
    res.redirect("/login");
  }
  
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  bcr
  let user = doesUserExist(email, users)
  console.log('testing user: ', user);
  
  if (password === '' || email === '') {
    res.status("400").send("Please don't leave any fields blank!");
  }
  
  console.log('email: ', email, 'password: ', password);
  console.log(letUserLogin(email, password));
  if (user) {
    // if (letUserLogin(email, password)) {
      if (true) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.status("403").send("Sorry, it looks like you've entered something incorrectly. Please try again!");
    }
  } else {
    res.status("403").send("Sorry, it doesn't look like we have an account associated with that email.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email === '' || password === '') {
    res.status("400").send("Please do not leave fields blank.");
  } else if (doesUserExist(email)) {
    res.status("400").send("It appears we already have a user registered with this email.");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: password,
    };
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});