"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// port
app.set("port", process.env.PORT || 5000);

// morgan
app.use(morgan("dev"));

// session
app.use(
  session({
    secret: "whisper enemy or leave",
    resave: true,
    saveUninitialized: false
  })
);

// mongodb connection
mongoose.connect("mongodb://localhost:27017/course-api", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

var db = mongoose.connection;
// mongo error
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function() {
  console.log("Connected to mongoose");
});

// send a friendly greeting for the root routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Course Review API!!!!!!"
  });
});

// include routes
var routes = require("./routes/index");
app.use("/api", routes);

// uncomment this route in order to test the global error handler
// app.get("/error", function(req, res) {
//   throw new Error("Test error");
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
