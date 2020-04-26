const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const uri =
  "mongodb+srv://admin:Shubhank12@cluster0-mulwf.mongodb.net/omega?retryWrites=true&w=majority";
const mongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const fileUpload = require("express-fileupload");
const store = new mongoStore({
  uri: uri,
  collection: "sessions"
});

// -------------------------------- routes import----------------

const authRoutes = require("./routes/auth");
const mainRoutes = require("./routes/main");

// ---------------------------------
//Middleware for handling the fileupload
app.use(fileUpload());
//for parsing the cookie data from request
app.use(cookieParser());
// for using session
app.use(
  session({
    secret: "shubhank",
    saveUninitialized: false,
    resave: true,
    store: store
  })
);
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

app.use(authRoutes);
app.use(mainRoutes);
const PORT = process.env.PORT || 3000;
mongoose
  .connect(uri)
  .then(() => {
    const db = mongoose.connection;
    app.listen(PORT, () => {
      console.log("server started at port 3000");
    });
  })
  .catch(err => {
    console.log("database connection error");
  });
const connection = mongoose.connection;
