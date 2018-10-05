
const express      = require("express"); // this imports the express module
const app          = express();
const PORT         = 8080; // default port 8080
const bodyParser   = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs"); // this tells the Express app to use EJS ad its templating engine

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


// ROUTE METHODS USING GET

// Renders page with list of urls
app.get("/urls", (req, res) => {
  console.log(req.cookies);


  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
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
    username: req.cookies.username
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

//Redirects page to the longURL webpagewhen short URL is passed to Search bar
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL  = urlDatabase[shortURL];

  res.redirect(longURL);
});


//Renders Short URLs: page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});

//Post to login -- cookie will remain when navigating pages
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//Post to logout -- clear cookies and return to login (/urls)
app.post("/logout", (req, res) => {

  res.clearCookie("username", req.cookies.username);
  res.redirect("/urls");
})





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});