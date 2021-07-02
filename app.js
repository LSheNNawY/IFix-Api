const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// mongodb connection
require("./helpers/dbConnection");

const indexRouter = require("./routes/index");
const professionRouter = require("./routes/profession");
const jobsRouter = require("./routes/jobs");
const userRouter = require("./routes/users");
const adminsRouter = require("./routes/admins");
const employeeRouter = require("./routes/employees");
const authenticationRouter = require("./routes/authentication");
const verify = require("./helpers/verify");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "./public/")));

app.use("/", indexRouter);
app.use("/api", [
  authenticationRouter,
  professionRouter,
  jobsRouter,
  userRouter,
  employeeRouter,
  adminsRouter,
]);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("error");
});

module.exports = app;
