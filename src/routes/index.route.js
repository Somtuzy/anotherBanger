const authRouter = require("../routes/auth.route");
const userRouter = require("../routes/user.route");
const googleAuthRouter = require("../routes/auth.google.route");
const categoryRouter = require("../routes/category.route");
const productRouter = require("../routes/product.route");
const filterRouter = require("../routes/filter.route");
const extraRouter = require("../routes/extra.route");
const login = require("../middlewares/isLoggedIn.middleware");

const basePath = "/api/v1";

module.exports = (app) => {
  app.use(`${basePath}/home`, login.isLoggedIn);
  app.use(`${basePath}/auth/google`, googleAuthRouter);
  app.use(`${basePath}/auth`, authRouter);
  app.use(`${basePath}/users`, userRouter);
  app.use(`${basePath}/categories`, categoryRouter);
  app.use(`${basePath}/products`, productRouter);
  app.use(`${basePath}/filter`, filterRouter);
  app.use(`${basePath}/`, extraRouter);
  app.use(`${basePath}/docs`, (req, res) => {
    return res.redirect(302, process.env.DOCS_URL);
  });
};
