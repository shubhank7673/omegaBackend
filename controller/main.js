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
        res.status(200).json({
          status: "ok",
          path: req.session.folderpath
        });
      }
    );
  } else {
    res.status(400).json({ error: "file not uploaded" });
  }
};
exports.postDownload = (req, res, next) => {
  if (!req.session.loggedIn) {
    res.json({ error: true, message: "user not logged in" });
  } else {
    const file = `${__dirname}/../storage/${req.session.userFolderPath}/171B130_echo_client.c.txt`; //${req.body.filename}`;
    res.download(file);
  }
};
