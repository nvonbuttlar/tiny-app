
const express      = require("express"); // this imports the express module
const app          = express();
const PORT         = 8080; // default port 8000
const bodyParser   = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs"); // this tells the Express app to use EJS ad its templating engine


// Data storage for user info
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
  },
  "321": {
    id: "321",
    email: "nick@gmail.com",
    password: "123"
  }
}


// we use this database to keep track of all the URLs  and their shortened forms
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Used function from StackOverflow
let generateRandomString = function() {

  var randomURL = "";
  var bank      = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < 5; i++)
    randomURL += bank.charAt(Math.floor(Math.random() * bank.length));

  return randomURL;
}


// ***ROUTE METHODS USING GET***

// Renders page with list of urls
app.get("/urls", (req, res) => {


  let templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]

  };
  res.render("urls_index", templateVars); //EJS knows to look to views folder for template files.ejs, therefor we can omit filename and pathway
});

// Delete function
app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// Renders new URL page
app.get("/urls/new", (req, res) => {

  let templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// Redirects back to Homepage after submission
app.post("/urls", (req, res) => {

  let longURL  = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});

// Redirects page to the longURL webpagewhen short URL is passed to Search bar
app.get("/u/:shortURL", (req, res) => {

  let shortURL = req.params.shortURL;
  let longURL  = urlDatabase[shortURL];
  res.redirect(longURL);
});


// Renders Short URLs: page
app.get("/urls/:id", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//Renders login page
app.get("/login", (req, res) => {

  res.render("login");
});

//Function to check if user email and password matches
function authenticateUser(email, password){
  for (var userID in users) {
    if(users[userID].email === email && users[userID].password === password){
      return users[userID];
    }
  }
}

app.post("/login", (req, res) => {

  let email    = req.body.email;
  let password = req.body.password;
  let result   = authenticateUser(email,password)

  if(result){
    res.cookie("user_id", result.id);
    res.redirect("/urls");
  } else{
    res.status(403).send("Username or password did not match")
  }

});


// Post to logout -- clear cookies and return to login (/urls)
app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Registration page
app.get("/register", (req, res) => {

  let templateVars = {
    user_id: users[req.cookies["user_id"]]
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  let newID       = generateRandomString();
  let newEmail    = req.body.email;
  let newPassword = req.body.password;

// Sends error for unfilled email/password fields
  if (!newEmail || !newPassword) {
    res.status(400).send('Fill out the fields Dummy!');
    return;
  }

// Checks for existing users, will send 400 if match
  for (var userID in users) {
    if (newEmail === users[userID].email) {
      res.status(400).send('This e-mail is already in use, please choose another.');
      return;
    }
  }
// This appends the global object users with a newUser
  users[newID] = {
    id: newID,
    email: newEmail,
    password: newPassword,
  };

  res.cookie("user_id", newID);
  res.redirect("/urls");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


