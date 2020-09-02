//app setup + middlewares
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//setting middlewares for use
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//user Database for storing info (rough setup)
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
}
//function declarations
function generateRandomString() {
  return Math.random().toString(36).substring(3, 9);
};

function doesUserExist(email) {
  for (let user in users) {
    if (user["email"] === email) {
      return user;
    }
  }
  return false;
};

function letUserLogin(email, password) {
  for (let user in users) {
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
};

function urlsForUser(id) {
  const userURLs = {};
  for (let url in urlDatabase) {
    if (url.userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}
//GET routes
//homepage when logged in, shows url index
app.get("/urls", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
});

//redirect to long URL after editing
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"], 
    urls: urlDatabase,
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"], 
    urls: urlDatabase,
  }
  res.render("urls_login", templateVars); 
})
//POST routes
//generate short URL and store it in databse
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = doesUserExist(email);
  
  if (password === '' || email === '') {
    res.status("400").send("Please don't leave any fields blank!");
  }
  
  if (user) {
    if (letUserLogin(email, password) === true) {
      res.cookie("user_id", user.id)
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
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    res.status("400").send("Please do not leave fields blank.");
  } else if (doesUserExist(email)) {
    res.status("400").send("It appears we already have a user registered with this email."); 
  } else {
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