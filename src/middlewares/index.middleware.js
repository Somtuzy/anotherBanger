const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const asyncError = require("./errors.middleware");
const indexRoute = require("../routes/index.route");
const { morganConfig, corsConfig, sessionConfig } = require("../configs/middleware.config")


require("../configs/db.config")();
require("./oauth/passport.middleware.js");

module.exports = (app) => {
  app.use(morgan(morganConfig));
  app.use(cors(corsConfig));
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(asyncError);
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
  indexRoute(app);
};
