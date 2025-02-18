const User = require("../models/user");
const File = require("../models/file");
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
cron.schedule("00 00 * * *", () => {
  User.find({}).then(users => {
    users.forEach(user => {
      user.operations.shift();
      user.operations.push({
        day: new Date().getDate(),
        delete: 0,
        upload: 0,
        download: 0
      });
      user
        .save()
        .then(result => {})
        .catch(err => {
          console.log(err);
        });
    });
  });
});
exports.getFileUpload = (req, res, next) => {
  // console.log(req.session.userFolderPath);
  res.render("uploadform.html");
};
exports.getUser = (req, res, next) => {
  User.findOne({ email: req.email })
    .then(user => {
      if (!user) {
        // console.log("in\n");
        // return res.status(500).json({ error: true, message: "invalid token" });
      }
      return res.json({ user: user });
    })
    .catch(err => console.log(err));
};
exports.test = (req, res, next) => {
  var mykey = crypto.createCipher("aes-128-cbc", "key");
  var mystr = mykey.update(
    "shubhank7673@gmsanhjsaj@12234@jsjdnail.com",
    "utf8",
    "hex"
  );
  mystr += mykey.final("hex");
  var mykey2 = crypto.createDecipher("aes-128-cbc", "key");
  var mystr2 = mykey2.update(
    "0673d4b37fa048045919a42ab84faafc6eb18dbbefb3b3ddb3f2168b115cb54c",
    "hex",
    "utf8"
  );
  mystr2 += mykey2.final("utf8");
  res.json({ key: mystr, decr: mystr2 });
};
exports.postFileUpload = (req, res, next) => {
  if (req.files) {
    // console.log("c1\n");
    User.findOne({ email: req.email })
      .then(user => {
        if (!user) {
          res.status(400).json({ error: true, message: "user not found" });
        }
        const file = req.files.file;
        let clientName = file.name;
        let extension = "";
        let fullName = clientName;
        const sp = clientName.split(".");
        if (sp.length > 1) {
          extension = sp[sp.length - 1];
        }
        if (clientName.length > 22) {
          clientName = clientName.substring(0, 22) + "...";
        }
        var mykey = crypto.createCipher("aes-128-cbc", "key");
        var mystr = mykey.update(req.email, "utf8", "hex");
        mystr += mykey.final("hex");
        const serverName = `${mystr.length}${"f" +
          mystr}${mongoose.Types.ObjectId()}ss`;
        const uploadDate = new Date().toLocaleDateString();
        file.name = serverName;
        const shared = true;
        const fl = {
          fullName,
          clientName,
          serverName,
          uploadDate,
          shared,
          extension
        };
        user.files.push(fl);
        user.operations[user.operations.length - 1].upload += 1;
        user.markModified("operations");
        // console.log(file);
        user
          .save()
          .then(user => {
            // console.log("inside\n");
            file.mv(`${__dirname}/../storage/${file.name}`, err => {
              if (err) throw err;
              res.status(200).json({
                // status: "ok",
                successful: true
                // path: req.session.folderpath
              });
            });
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
        res
          .status(400)
          .json({ error: true, message: "error while getting user from db" });
      });
    // res.json({successful:true});
  } else {
    res.status(400).json({ error: "file not uploaded" });
  }
};
exports.getDownload = (req, res, next) => {
  // console.log("hit\n");
  // console.log(req.params.filename.split("-")[0]);
  let fileName = req.params.filename.split("-")[0];
  let ind = fileName.indexOf("f");
  let len = parseInt(fileName.substring(0, ind));
  let hash = fileName.substring(ind + 1, ind + len + 1);
  var mykey = crypto.createDecipher("aes-128-cbc", "key");
  // console.log(hash);
  var email = mykey.update(hash, "hex", "utf8");
  email += mykey.final("utf8");
  // console.log(mystr);
  if (fileName.substring(fileName.length - 2, fileName.length) === "ns") {
    return res.json({ error: true, message: "file is private" });
  }
  const file = `${__dirname}/../storage/${req.params.filename.split("-")[0]}`; //${req.body.filename}`;
  return res.download(file, err => {
    if (err) {
      return res.json({ error: true, message: "file not found" });
    }
    User.findOne({ email: email }).then(user => {
      if (!user) {
        return;
      }
      user.operations[user.operations.length - 1].download += 1;
      user.markModified("operations");
      user
        .save()
        .then()
        .catch(err => console.log(err));
    });
  });
};
exports.postDelete = (req, res, next) => {
  // console.log(req.email);
  User.findOne({ email: req.email })
    .then(user => {
      if (!user) {
        console.log(".............inside..............\n");
      }
      // console.log(req.body.fileId);
      user.files = user.files.filter(file => {
        return file.serverName.toString() !== req.body.fileId.toString();
      });
      user.operations[user.operations.length - 1].delete += 1;
      user.markModified("operations");
      user
        .save()
        .then(usr => {
          fs.unlink(
            `${__dirname}/../storage/${req.body.fileId.toString()}`,
            err => {
              console.log(err);
            }
          );
          return res.json({ successful: true });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};
exports.getUserFiles = (req, res, next) => {
  User.findOne({ email: req.email })
    .then(user => {
      return res.json({ userFiles: user.files });
    })
    .catch(err => console.log(err));
};
exports.getChangeFilestatus = (req, res, next) => {
  User.findOne({ email: req.email })
    .then(user => {
      if (!user) {
        return res.json({ error: true, message: "user not found" });
      }
      let newServerName = req.params.filename;
      let error = false;
      user.files.forEach((file, index) => {
        // console.log(file.serverName, req.params.filename);
        if (file.serverName === req.params.filename) {
          // console.log("indi\n");
          let status = file.serverName.substring(
            file.serverName.length - 2,
            file.serverName.length
          );
          if (status === "ss") {
            // console.log(user.files[index].serverName);
            let oldp = `${__dirname}/../storage/${user.files[index].serverName}`;
            // console.log(oldp);
            user.files[index].serverName =
              file.serverName.substring(0, file.serverName.length - 2) + "ns";
            fs.rename(
              oldp,
              `${__dirname}/../storage/${user.files[index].serverName}`,
              err => {
                error = err;
              }
            );
          } else if (status === "ns") {
            let oldp = `${__dirname}/../storage/${user.files[index].serverName}`;
            user.files[index].serverName =
              file.serverName.substring(0, file.serverName.length - 2) + "ss";
            fs.rename(
              oldp,
              `${__dirname}/../storage/${user.files[index].serverName}`,
              err => {
                error = err;
              }
            );
          }
          newServerName = user.files[index].serverName;
          user.files[index].shared = !user.files[index].shared;
        }
      });
      if (error) {
        return res.json({
          successful: false,
          error: true,
          message: "some error in fs rename"
        });
      }
      user.markModified("files");
      user
        .save()
        .then(user => {
          return res.json({ successful: true, newServerName });
        })
        .catch(err => console.log(err));
    })
    .catch(err => conosole.log(err));
};
exports.getPrivateFileDownload = (req, res, next) => {
  let filename = req.params.filename.split("-")[0];
  User.findOne({ email: req.email })
    .then(user => {
      if (!user) {
        return res.json({ error: true, message: "user not found" });
      }
      let found = false;
      user.files.forEach(file => {
        if (file.serverName === filename) {
          found = true;
        }
      });
      if (found) {
        res.download(`${__dirname}/../storage/${filename}`, err => {
          console.log("gere");
          if (err) {
            console.log(err);
            return;
          }
          user.operations[user.operations.length - 1].download += 1;
          user.markModified("operations");
          user
            .save()
            .then(() => {})
            .catch(err => {
              console.log(err);
            });
        });
      } else {
        return res.json({
          error: true,
          message: "either file doesn't exist or doesn't belong to this user"
        });
      }
    })
    .catch(err => console.log(err));
};
exports.postChangeUsername = (req, res, next) => {
  // console.log(req.email);
  User.findOne({ email: req.email })
    .then(user => {
      // console.log(user);
      // console.log(req.body.name);
      user.name = req.body.newName;
      // user.markModified("name");
      user
        .save()
        .then(result => {})
        .catch(err => {
          console.log(err);
        });
      res.json({ successful: true });
    })
    .catch(err => {
      console.log(err);
    });
};
exports.postPasswordChange = (req, res, next) => {
  // console.log("hit");
  User.findOne({ email: req.email })
    .then(user => {
      let hashedPass = "";
      try {
        hashedPass = bcrypt.hashSync(req.body.newPassword, 12);
        // console.log(hashedPass);
      } catch (err) {
        res
          .status(200)
          .json({ error: true, message: "error while encrypting password" });
      }
      user.password = hashedPass;
      user
        .save()
        .then(result => {
          return res.json({ successful: true });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};
