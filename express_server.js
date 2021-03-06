
const PORT          =  8080; // Default port 8000
const express       =  require("express"); // This imports the express module
const app           =  express();
const bodyParser    =  require("body-parser");
const cookieSession =  require('cookie-session');
const bcrypt        =  require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine
app.use(cookieSession({
  name : 'session',
  keys : ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Data storage for user info
const users = {
  "userRandomID": {
          id : "userRandomID",
       email : "user@example.com",
    password : bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
          id : "user2RandomID",
       email : "user2@example.com",
    password : bcrypt.hashSync("dishwasher-funk", 10)
  },
  "321": {
          id : "321",
       email : "nick@gmail.com",
    password : bcrypt.hashSync("123", 10)
  }
}



// We use this database to keep track of all the URLs  and their shortened forms
let urlDatabase = {

  "b2xVn2": {
    shortURL : "b2xVn2",
     longURL : "http://www.lighthouselabs.ca",
      userID : "userRandomID",
  },

  "9sm5xK": {
    shortURL : "9sm5xK",
     longURL : "http://www.google.ca",
      userID : "user2RandomID"
  }
}

function getsUserUrls(id){

  let newArray = [];
  let userURLs = {};

  for (let keys in urlDatabase) {
    if (id === urlDatabase[keys].userID) {
        userURLs[keys] = urlDatabase[keys].longURL;
      }
    }
    return userURLs;
}

// Used function from StackOverflow
let generateRandomString = function() {

  let randomURL   = "";
  const bank      = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < 5; i++)
    randomURL += bank.charAt(Math.floor(Math.random() * bank.length));

  return randomURL;
}


// ***ROUTE METHODS USING GET***

// Renders index page with list of urls
app.get("/urls", (req, res) => {

  let authenticatedUser;
  if(req.session["user_id"]){
    authenticatedUser = getsUserUrls(users[req.session["user_id"]].id);

    let templateVars = {
         urls : authenticatedUser,
      user_id : users[req.session["user_id"]]
    }

    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
 // EJS knows to look to views folder for template files.ejs, therefore we can omit filename and pathway
});

// Delete function
app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// Renders new URL page
app.get("/urls/new", (req, res) => {

  let templateVars = {
       urls : urlDatabase,
    user_id : users[req.session["user_id"]].id
  };

  if (users[req.session["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

// Post request from /urls/new
app.post("/urls", (req, res) => {

  let longURL  = req.body.longURL;
  let shortUrl = generateRandomString();

  urlDatabase[shortUrl] = {
    shortURL : shortUrl,
     longURL : longURL,
      userID : users[req.session["user_id"]].id
  };

  res.redirect("/urls");
});

// Redirects page to the longURL webpagewhen short URL is passed to Search bar
// Need http:// in order for new URL's to redirect properly
app.get("/u/:shortURL", (req, res) => {

  let shortURL = req.params.shortURL;
  let longURL  = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// Renders Short URLs: page
app.get("/urls/:id", (req, res) => {

  let templateVars = {
    shortURL : req.params.id,
     longURL : urlDatabase[req.params.id],
     user_id : users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Renders login page
app.get("/login", (req, res) => {

  res.render("login");
});

// Function to check if user email and password matches
function authenticateUser(email, password){

  for (var userID in users) {
    if(users[userID].email === email && bcrypt.compareSync(password, users[userID].password)){
      return users[userID];
    }
  }
}

app.post("/login", (req, res) => {

  let email    = req.body.email;
  let password = req.body.password;
  let result   = authenticateUser(email,password)
  if(result){
    req.session.user_id = result.id;
    res.redirect("/urls");
  } else{
    res.status(403).send("Username or password did not match")
  }
});


// Post to logout -- clear cookies and return to login (/urls)
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");
});

// Registration page
app.get("/register", (req, res) => {

  let templateVars = {
    user_id : users[req.session["user_id"]]
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  let newID          = generateRandomString();
  let newEmail       = req.body.email;
  let newPassword    = req.body.password;
  let hashedPassword = bcrypt.hashSync(newPassword, 10);

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
          id : newID,
       email : newEmail,
    password : hashedPassword,
  };

  req.session.user_id = newID;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
