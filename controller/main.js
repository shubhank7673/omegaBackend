const User = require("../models/user");
const File = require("../models/file");
const mongoose = require("mongoose");
const fs = require("fs");
exports.getFileUpload = (req, res, next) => {
  console.log(req.session.userFolderPath);
  res.render("uploadform.html");
};
exports.postFileUpload = (req, res, next) => {
  if (req.files) {
    console.log("c1\n");
    User.findOne({ email: req.email })
      .then(user => {
        if (!user) {
          console.log("c2\n");
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
        const serverName = `${mongoose.Types.ObjectId()}ss`;
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
        console.log(file);
        user
          .save()
          .then(user => {
            console.log("inside\n");
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
  console.log(req.params.filename.split("-")[0]);
  let fileName = req.params.filename.split("-")[0];
  if (fileName.substring(fileName.length - 2, fileName.length) === "ns") {
    return res.json({ error: true, message: "file is private" });
  }
  const file = `${__dirname}/../storage/${req.params.filename.split("-")[0]}`; //${req.body.filename}`;
  return res.download(file, err => {
    if (err) {
      res.json({ error: true, message: "file not found" });
    }
    console.log(err);
  });
};
exports.postDelete = (req, res, next) => {
  console.log(req.email);
  User.findOne({ email: req.email })
    .then(user => {
      if (!user) {
        console.log(".............inside..............\n");
      }
      console.log(req.body.fileId);
      user.files = user.files.filter(file => {
        return file.serverName.toString() !== req.body.fileId.toString();
      });
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
  User.findOne({ email: req.body.email })
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
        console.log(file.serverName, req.params.filename);
        if (file.serverName === req.params.filename) {
          console.log("indi\n");
          let status = file.serverName.substring(
            file.serverName.length - 2,
            file.serverName.length
          );
          if (status === "ss") {
            // console.log(user.files[index].serverName);
            let oldp = `${__dirname}/../storage/${user.files[index].serverName}`;
            console.log(oldp);
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
  console.log(filename);
  if (filename.substring(filename.length - 2, filename.length) === "ss") {
    console.log(filename.substring(filename.length - 2, filename.length))
    return res.download(`${__dirname}/../storage/${filename}`);
  }
  User.findOne({ email: req.email }).then(user => {
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
      return res.download(`${__dirname}/../storage/${filename}`);
    } else {
      return res.json({
        error: true,
        message: "either file doesn't exist or doesn't belong to this user"
      });
    }
  })
  .catch(err => console.log(err));

};
