
var express = require("express"); // this imports the express module
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); // this tells the Express app to use EJS ad its templating engine

// we use this database to keep track of all the URLs  and their shortened forms
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Used function from StackOverflow
let generateRandomString = function() {
  var randomURL = "";
  var bank = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < 5; i++)
    randomURL += bank.charAt(Math.floor(Math.random() * bank.length));

  return randomURL;
}


// ROUTE METHODS USING GET

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// Renders page with list of urls
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars); //EJS knows to look to views folder for template files.ejs, therefor we can omit filename and pathway
});

// Delete function
app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});


// Renders new URL page
app.get("/urls/new", (req, res) => {

  res.render("urls_new");
});

// Redirects back to Homepage after submission
app.post("/urls", (req, res) => {
  console.log(req.body);
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");

});

//Redirects page to the longURL webpagewhen short URL is passed to Search bar
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});


//Renders Short URLs: page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});









app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});