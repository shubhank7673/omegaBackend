exports.getFileUpload = (req, res, next) => {
  console.log(req.session.userFolderPath);
  res.render("uploadform.html");
};
exports.postFileUpload = (req, res, next) => {
  if (req.files) {
    const file = req.files.file;
    file.mv(
      `${__dirname}/../storage/${req.session.userFolderPath}/${file.name}`,
      err => {
        if (err) throw err;
        res
          .status(400)
          .send(
            "file upload successfully check",
            req.session.userFolderPath,
            "folder"
          );
      }
    );
  } else {
    res.send("no files uploaded");
  }
};
