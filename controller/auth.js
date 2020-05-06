var folderpath = __dirname + "../storage/";
const fs = require("fs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
exports.getUser = (req, res, next) => {
  User.findOne({ email: req.email })
    .then(user => {
      if (!user) {
        return res.status(500).json({ error: true, message: "invalid token" });
      }
      return res.json({ user: user });
    })
    .catch(err => console.log(err));
};
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
      const compareRes = bcrypt.compareSync(req.body.password, user.password);
      if (compareRes) {
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
      res.status(200).json({ userExists: true });
    } else {
      let hashedPass = "";
      try {
        hashedPass = bcrypt.hashSync(req.body.password, 12);
        console.log(hashedPass);
      } catch (err) {
        res
          .status(200)
          .json({ error: true, message: "error while encrypting password" });
      }
      console.log(req.body);
      let operations = [];
      let dt = new Date();
      for (let i = 0; i < 30; i++) {
        operations.push({
          day: dt.getDate(),
          delete: 0,
          upload: 0,
          download: 0
        });
        dt.setDate(dt.getDate() - 1);
      }
      operations.reverse();
      const user = new User({
        email: req.body.email,
        name: req.body.name,
        // lastName: req.body.lastname,
        password: hashedPass,
        operations,
        files: []
      });
      user
        .save()
        .then(user => {
          const token = jwt.sign(
            { email: req.body.email },
            "secret_private_key"
          );
          res
            .status(200)
            .json({ status: "ok", email: req.body.email, token: token });
        })
        .catch(err => {
          if (err) {
            console.log("in.........................");
            console.log(err);
            res.status(200).json({ error: true, message: err });
          }
        });
    }
  });
};
exports.check = (req, res, next) => {
  bcrypt.hash("mypassword", 10, function(err, hash) {
    if (err) {
      throw err;
    }

    bcrypt.compare(
      "$2b$12$YCxhKcgUHgM6OxLjX6FzAOAt42ypNXER8xar4uNONjcyrti1bz3wO",
      "123",
      function(err, result) {
        if (err) {
          throw err;
        }
        console.log(result);
      }
    );
  });
};