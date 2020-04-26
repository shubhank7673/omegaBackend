const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const authRoutes = require("./routes/auth");
const bodyParser = require("body-parser");
const uri =
  "mongodb+srv://admin:lolz@cluster0-mulwf.mongodb.net/omega?retryWrites=true&w=majority";
const mongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
//for parsing json data
app.use(bodyParser.json());
// for parsing post form data
app.use(bodyParser.urlencoded({ extended: true }));
//giving the path to static files like css,js,images etc.
app.use(express.static(path.join(__dirname, "public")));
app.set("views", __dirname + "/views");
// to render html files
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use("/", authRoutes);

const PORT = process.env.PORT || 3000;
mongoose
  .connect(uri)
  .then(() => {
    console.log("database connected");
    app.listen(PORT, () => {
      console.log("server started at port 3000");
    });
  })
  .catch(err => {
    console.log("database connection error");
  });
