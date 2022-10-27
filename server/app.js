const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { COOKIE_SECRET } = process.env;

const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

const app = express();

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 1000000,
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser(COOKIE_SECRET));
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("error");
});

module.exports = app;
