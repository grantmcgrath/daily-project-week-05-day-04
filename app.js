const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const validator = require("express-validator");
const bp = require("body-parser");
const app = express();
const username = require("./users");

app.engine("handlebars", handlebars());
app.set("views", "./views");
app.set("view engine", "handlebars");

app.use(express.static("public"));

app.use(validator());

app.use(bp.json());
app.use(bp.urlencoded({
  extended: false
}));

app.use(session({
  secret: "ninja",
  resave: false,
  aveUninitialized: true
}));

// If the user is loged in, they are directed to the home page.
app.get("/", function(req, res) {
  if (!req.session.username) {
    return res.redirect("/login");
  } else {
    res.render("home", {
      username: req.session.username
    });
  }
});

// Route for login page.
app.get("/login", function(req, res) {
  res.render("login");
});

// Route if username and password match record.
app.post("/login", function(req, res) {
  req.checkBody("username", "A username is required.").notEmpty();
  req.checkBody("password", "A password is required.").notEmpty();

  let error = req.validationErrors();
  if (error) {
    return res.render("login", {error: error});
  }

  let user = username.filter(function(usernameValidation) {
    return usernameValidation.username === req.body.username;
  });

  if (user.length === 0) {
    error = [{errorMessage: "Username does not match our records."}];
    res.render("login", {error: error});
    return;
  }

  let pass = user[0];

  if (pass.password === req.body.password) {
    req.session.username = pass.username;
    res.redirect("/");
  } else {
    error = [{errorMessage: "The password entered is incorrect."}];
    res.render("login", {error: error});
  }
});

app.listen(3000, function(){
  console.log("Port 3000 listening.");
});
