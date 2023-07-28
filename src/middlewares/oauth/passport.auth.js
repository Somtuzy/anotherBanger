const { generateToken } = require("../../services/jwt.service");
const notify = require("../../services/mail.service");
const Mails = require("../../configs/mails.constant.config");

const createUserToken = async (req, res) => {
  if (req.user === "alreadyExistsWithSameEmailAndAPassword") {
    return res.status(403).json({
      status: false,
      message:
        "This email belongs to an active user, if this is you, login with your email and password to continue.",
    });
  }

  const token = await generateToken({
    id: req.user._id,
    fullname: req.user.fullname,
  });

  if (req.user.exists) {
    // sends login notification
    await notify.sendMail(
      req.user,
      req.user.email,
      Mails.loggedIn.subject,
      Mails.loggedIn.body
    );

    delete req.user.password;
    console.log("User logged in successfully:", req.user);

    // Retuns credentials to the client side
    const encodedUser = encodeURIComponent(req.user);
    const encodedToken = encodeURIComponent(token);

    const productPage = `${process.env.BASE_URL}/product-page?user=${encodedUser}&token=${encodedToken}`;
    return res.redirect(302, productPage);
  }

  // sends signup notification
  await notify.sendMail(
    req.user,
    req.user.email,
    Mails.accountCreated.subject,
    Mails.accountCreated.body
  );

  delete req.user.password;
  console.log("User signed up successfully:", req.user);

  const encodedUser = encodeURIComponent(req.user);
  const encodedToken = encodeURIComponent(token);

  const productPage = `${process.env.BASE_URL}/product-page?user=${encodedUser}&token=${encodedToken}`;
  return res.redirect(302, productPage);
};

module.exports = createUserToken;
