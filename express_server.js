const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

const bcrypt = require("bcrypt");

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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "GMwYL5" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "GMwYL5" },
  ed53vd: { longURL: "http://twitter.com", userID: "7hXWLw" },
  d3f355: { longURL: "http://wikipedia.com", userID: "7hXWLw" },
  sf34sf: { longURL: "http://www.lighthouselabs.ca", userID: "wUHWhw" },
  wwKFoE: { longURL: "http://www.buzzfeed.com", userID: "J2J1f2" },
  SngLcS: { longURL: "http://www.facebook.com", userID: "J2J1f2" },
};

const users = {
  "7hXWLw": {
    id: "7hXWLw",
    email: "user@example.com",
    password: "$2b$10$15uYCNfhoMtdbGtos55G7ultdCoJ7b14QGJr3YwpoOXmvznpdpQSG",
    //   password: "purple-monkey-dinosaur"
  },
  wUHWhw: {
    id: "wUHWhw",
    email: "user2@example.com",
    password: "$2b$10$1R83e4316.RtpB6ziu.dnOLbY9Dlt69BFFJUBpAWMOcvE4Fi8UMjm",
    //   password: "dishwasher-funk",
  },
  J2J1f2: {
    id: "J2J1f2",
    email: "email@example.com",
    password: "$2b$10$9Bc6Tf4vmOoZRH74K20jougZr2txG3scMNBrmYYmKWx1jSiWMRfTy",
    //  passord: 123
  },
  GMwYL5: {
    id: "GMwYL5",
    email: "123@123.com",
    password: "$2b$10$dVOO.Ph7fb5TiVcczm4CN.anweFfOoU97l2y4KTLtljnNIrE2QmLy",
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
  const userID = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  console.log(urlDatabase);
  res.render("urls_index", templateVars);
});

//page that allows user to register
app.get("/urls/register", (req, res) => {
  const userID = req.session.user_id;
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
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = { id: userID, email: email, password: hashedPassword };
    console.log(users);
    req.session.user_id = userID;
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
    const hashedPassword = users[key].password;
    if (bcrypt.compareSync(enteredPassword, hashedPassword)) {
      return true;
    }
  }
  return false;
};

//new page that allows user to login
app.get("/urls/login", (req, res) => {
  const userID = req.session.user_id;
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
    const keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].email === email) {
        const currentID = users[key].id;
        console.log(currentID);
        console.log(users);
        req.session.user_id = currentID;
        res.redirect("/urls");
      }
    }
  }
});

//page that allows user to create a new url
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  if (templateVars.currentUser !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//edit url and redirect to it's page
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const templateVars = {
    urls: urlDatabase,
    currentUser: users[userID],
    userID: userID,
  };
  const urlUserId = templateVars.urls[shortURL].userID;
  if (userID === templateVars.currentUser.id && userID === urlUserId) {
    const { longURL } = req.body;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    console.log("Cannot edit");
  }
});

//page that displays a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //look up longURL in our url database using shortURL as our key
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.user_id;
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    currentUser: users[userID],
    urls: urlDatabase,
    userID: req.session.user_id,
  };
  res.render("urls_show", templateVars);
});

//redirects the short url to the actual webpage
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const templateVars = {
    currentUser: users[userID],
    urls: urlDatabase,
    userID: req.session.user_id,
  };
  const url = templateVars.urls[shortURL].longURL;
  res.redirect(url);
});

//delete a url and redirect to home page
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const templateVars = {
    currentUser: users[userID],
    urls: urlDatabase,
    userID: req.session.user_id,
  };
  if (templateVars.urls[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    console.log("Cannot delete");
  }
});

//add url to the database and redirect to the tiny url's page
app.post("/urls", (req, res) => {
  const { longURL } = req.body; // Log the POST request body to the console
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const templateVars = {
    currentUser: users[userID],
    urls: urlDatabase,
    userID: req.session.user_id,
  };
  //add new url to the url database
  templateVars.urls[shortURL] = { longURL: longURL, userID: userID };
  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`);
});

//logout page, clears the userID cookie and redirects to home page
app.post("/logout", (req, res) => {
  //clear cookie
  req.session.user_id = null;
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
