var folderpath = __dirname+"../storage/";
const fs = require("fs");
const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    res.send(req.session.user.email);
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
  // const obj = { email: req.body.email, password: req.body.password };
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      res.send("user not found");
    } else {
      if (user.password == req.body.password) {
        req.session.loggedIn = true;
        req.session.user = user;
        req.session.save(err => {
          if (err) {
            console.log("error while saving the session in login -", err);
            res.redirect("/login");
          } else {
            req.session.userFolderPath = (req.body.email.split('@')[0]).toLowerCase();
            res.send("logged in succesfully");
          }
        });
      }
      else{
        res.send('incorrect password');
      }
    }
  });
};
exports.postSignup = (req, res, next) => {
  User.findOne({
    email: req.body.email
  }).then(existingUser => {
    if (existingUser) {
      res.send("user with the provided email already exists");
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
          fs.mkdir(folderpath + (req.body.email.split("@")[0]).toLowerCase(), (r, err) => {
            if (err) {
              User.deleteOne({ email: user.email });
              console.log("inside");
              throw err;
            }
            req.session.loggedIn = true;
            req.session.userFolderPath = (req.body.email.split('@')[0]).toLowerCase();
            req.session.user = user;
            req.session.save(err => {
              if (err) {
                console.log("error while saving the session in login -", err);
                res.redirect("/login");
              } else {
                res.send("user added succesfully");
              }
            });
          });
        })
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    }
  });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log("error while logging out ", err);
    }
    res.redirect("/");
  });
};
