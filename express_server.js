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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//page that displays a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //look up longURL in our url database using shortURL as our key
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

//add url to the database and redirect to the tiny url's page
app.post("/urls", (req, res) => {
  const { longURL } = req.body; // Log the POST request body to the console
  const shortURL = generateRandomString();
  //add new url to the url database
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

//redirects the short url to the actual webpage
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//use HTML code to pring Hello World with "world" bolded
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//delete a url and redirect to home page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit url and redirect to it's page
app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//login page, store the username in a cookie and redirects to home page
app.post("/login/", (req, res) => {
  const username = req.body["username"];
  res.cookie("username", username);
  res.redirect("/urls/");
});

//logout page, clears the username cookie and redirects to home page
app.post("/logout/", (req, res) => {
  const username = req.body["username"];
  res.clearCookie("username", username);
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
