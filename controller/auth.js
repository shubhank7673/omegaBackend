var folderpath = "./storage/";
const fs = require("fs");
const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  res.render("login.html");
};
exports.getSignup = (req, res, next) => {
  res.render("signup.html");
};
exports.postLogin = (req, res, next) => {
  const obj = { username: req.body.username, password: req.body.password };
  res.send("user added succesfully"); 
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
          fs.mkdir(folderpath + req.body.email.split("@")[0],(r,err)=>{
            if(err)
            {
              console.log('inside');
              throw err
            }
            res.send('user added suc');
          })
        })
        .catch(err => {
          if (err) {
            throw err;
          }
        });
    }
  });
};
