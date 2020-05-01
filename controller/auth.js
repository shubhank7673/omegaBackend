var folderpath = __dirname + "../storage/";
const fs = require("fs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.getAuthStatus = (req, res, next) => {
  if (req.session.loggedIn) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
};
exports.getLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("login.html");
  }
};
exports.getSignup = (req, res, next) => {
  if (req.session.loggedIn) {
    res.send(req.session.user.email);
  } else {
    res.render("signup.html");
  }
};
exports.postLogin = (req, res, next) => {
  console.log(req.body.email, req.body.password);
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      res.json({ userFound: false });
    } else {
      if (user.password == req.body.password) {
        req.session.loggedIn = true;
        req.session.user = user;
        req.session.save(err => {
          if (err) {
            res.status(400).json({ error: true, message: err });
          } else {
            req.session.userFolderPath = "";
            const token = jwt.sign(
              { email: req.body.email },
              "secret_private_key"
            );
            res.status(200).json({
              status: "ok",
              userFound: true,
              correctPassword: true,
              token: token
            });
          }
        });
      } else {
        res.json({ userFound: true, correctPassword: false });
      }
    }
  });
};
exports.postSignup = (req, res, next) => {
  User.findOne({
    email: req.body.email
  }).then(existingUser => {
    if (existingUser) {
      res.status(400).json({ userExists: true });
    } else {
      const user = new User({
        email: req.body.email,
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        password: req.body.password
      });
      user
        .save()
        .then(user => {
          const token = jwt.sign(
            { email: req.body.email },
            "secret_private_key"
          );
          res.status(200).json({ status: "ok",email:req.body.email, token: token });
        })
        .catch(err => {
          if (err) {
            res.status(500).json({ error: true, message: err });
            // throw err;
          }
        });
    }
  });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      res.status(500).json({ error: true, message: err });
      // console.log("error while logging out ", err);
    }
    res.status(200).json({ status: "ok" });
    // res.redirect("/");
  });
};
