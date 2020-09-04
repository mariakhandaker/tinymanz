//app setup + packages + modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//helper functions and databases
const { getUserByEmail, letUserLogin, urlsForUser, urlDatabase, users } = require('./helpers');
const salts = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['w3-luv-c00ki3s', '3sp3ci411y ch0c0l8 1s', 'p0lyhymni4'],
}));

//shortURL and userID generator function
const generateRandomString = () => {
  return Math.random().toString(36).substring(3, 9);
};

//when logged in, goes to your urls, else log in first to view
app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//if user logged in, show urls, else error
app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(user),
    user: user,
  };
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.send("Please log in first to view your urls.");
  }
});

//if user logged in, show form to submit new URL
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.redirect("/login");
  }
  let templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

//redirect to long URL if you click on the shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status("400").send("This short URL does not exist.");
  }
});

//if logged in, check for errors, otherwise show url
//if not logged in, redirect to login
app.get("/urls/:shortURL", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.send("Please log in to view your short URLs!").redirect("/login");
  } else {
    const shortURL = req.params.shortURL;
    if (!urlDatabase[shortURL]) {
      res.send("Error! Short URL does not exist (yet!)");
    } else if (user !== urlDatabase[shortURL].userID) {
      res.send("It appears you are not the owner of this shortURL!");
    }
    const templateVars = {
      user,
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
    };
    res.render("urls_show", templateVars);
  }
});

//generate short URL and store it in databse
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL,
      userID: user
    };
    res.redirect("/urls/" + shortURL);
  } else {
    res.send("Please log in to create a new TinyURL.");
  }
  
});

//modify longURL only if logged in and if shortURL belongs to the user
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.session.user_id;
  
  if (!user) {
    res.send("Please log in to view.");
  }
  if (user === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls/");
  }
  if (user !== urlDatabase[shortURL].userID) {
    res.send("It appears you don't own this shortURL! Please return.");
  }
});

//only delete URL if logged in + owner of URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  if (!user) {
    res.send("You must be logged in to delete a URL.");
  }
  if (user === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  if (user !== urlDatabase[shortURL].userID) {
    res.send("It appears you don't own this shortURL! Unfortunately you can't delete it.");
  }
});

//if logged in, redirect to urls, else log in form displays
app.get("/login", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  }
  
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_login", templateVars);
});

//if logged in, redirect to urls, else register form displays
app.get("/register", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  }
  
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

//login if email + password work, otherwise redirect
app.post("/login", (req, res) => {
  const email = req.body.email;
  
  if (getUserByEmail(email, users) === false) {
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

//create a new user with a unique ID
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status("400").send("Please do not leave either field blank!");
  } else if (getUserByEmail(email, users)) {
    res.status("400").send("It appears we already have a user registered with this email.");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, salts),
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

//logout, clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});