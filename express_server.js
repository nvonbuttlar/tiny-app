
var express = require("express"); // this imports the express module
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // this tells the Express app to use EJS ad its templating engine



// we use this database to keep track of all the URLs  and their shortened forms
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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

app.get("/urls", (req, res) => { // this passes our URL database to the urls_index template

  let templateVars = {urls: urlDatabase}

  res.render("urls_index", templateVars) //EJS knows to look to views folder for template files.ejs, therefor we can omit filename and pathway
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});