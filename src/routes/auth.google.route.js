const { Router } = require('express');
const passport = require('passport');
const  createUserToken = require('../middlewares/oauth/passport.auth');

const googleAuthRouter = Router();

googleAuthRouter.get("/", passport.authenticate("google", { scope: ["email", "profile"] }));

googleAuthRouter.get("/callback", passport.authenticate("google", { failureRedirect: "/login" }), createUserToken);

module.exports = googleAuthRouter;
