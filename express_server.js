const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  h34Jak: "http://twitter.com",
  s8fjj2: "http://wikipedia.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//set the view engine to ejs
app.set("view engine", "ejs");

//homepage: displays hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

//displays JSON string representing the entire urlDatabase object
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//render the urls_index ejs file
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  res.render("urls_index", templateVars);
});

//page that allows user to register
app.get("/urls/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  res.render("register", templateVars);
});

//new register a new user
app.post("/register", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  if (email === "" || password === "") {
    res.status(400);
    res.send("Response - 400 Empty Email or Password");
  } else if (duplicateEmail(email)) {
    res.status(400);
    res.send("Response - 400 Account already exists!");
  } else {
    userID = generateRandomString();
    users[userID] = { id: userID, email: email, password: password };
    console.log(users);
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

//checks if user email is in the database already
const duplicateEmail = function (checkEmail) {
  const keys = Object.keys(users);
  for (let key of keys) {
    if (checkEmail === users[key].email) {
      return true;
    }
  }
  return false;
};

//checks if password matches the one in the database
const validatePassword = function (enteredPassword) {
  console.log("in function");
  const keys = Object.keys(users);
  for (let key of keys) {
    if (enteredPassword === users[key].password) {
      console.log("passwords are the same");
      return true;
    }
  }
  return false;
};

//new page that allows user to login
app.get("/urls/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  res.render("login", templateVars);
});

//login page, store the userID in a cookie and redirects to home page
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  if (email === "" || password === "") {
    res.status(400);
    res.send("Response - 400 Empty Email or Password");
  } else if (duplicateEmail(email) === false) {
    res.status(400);
    res.send("Response - 403 Account doesn't exist, please register");
  } else if (validatePassword(password) === false) {
    res.status(400);
    res.send("Response - 403 Account doesn't exist, please register");
  } else {
    userID = generateRandomString();
    users[userID] = { id: userID, email: email, password: password };
    console.log(users);
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

//page that allows user to create a new url
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  res.render("urls_new", templateVars);
});

//page that displays a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //look up longURL in our url database using shortURL as our key
  const longURL = urlDatabase[shortURL];
  const userID = req.cookies["user_id"];
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    currentUser: users[userID],
    urls: urlDatabase,
    userID: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

//redirects the short url to the actual webpage
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//delete a url and redirect to home page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//add url to the database and redirect to the tiny url's page
app.post("/urls", (req, res) => {
  const { longURL } = req.body; // Log the POST request body to the console
  const shortURL = generateRandomString();
  //add new url to the url database
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

//edit url and redirect to it's page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//logout page, clears the userID cookie and redirects to home page
app.post("/logout", (req, res) => {
  const userID = req.body["user_id"];
  res.clearCookie("user_id", userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
