//app setup + middlewares
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, letUserLogin, urlsForUser, urlDatabase, users } = require('./helpers');

//setting some packages for use
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['w3-luv-c00ki3s', '3sp3ci411y ch0c0l8 1s', 'p0lyhymni4'],
}));

app.set("view engine", "ejs");

//function declarations
const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

//GET routes
//homepage when logged in, shows url index
app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(user, urlDatabase),
    user: users[user],
  };
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } 
  let templateVars = {
    user: req.session.user_id,
    urls: urlsForUser(user),
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
    user: req.session.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase,
  };
  res.render("urls_login", templateVars);
});

//POST routes
//generate short URL and store it in databse
app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls/" + shortURL);
  }
);

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls/");
  } else {
    res.redirect("/login");
  } 
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  
  if (doesUserExist(email, users) === false) {
    res.status("403").send("Sorry, it doesn't look like we have an account associated with that email.");
  } 
  
  const password = req.body.password;
  
  if (password === '' || email === '') {
    res.status("400").send("Please don't leave any fields blank!");
  } 
  
  const user = letUserLogin(email, password);

  if (user) {
    req.session.user_id = "user_id";
    res.redirect("/urls");
  } else {
    res.status("403").send("Sorry, it looks like you've entered something incorrectly. Please try again!");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email === '' || password === '') {
    res.status("400").send("Please do not leave either field blank!");
  } else if (getUserByEmail(email, users)) {
    res.status("400").send("It appears we already have a user registered with this email.");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: password,
      hashedPassword: hashedPassword
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});