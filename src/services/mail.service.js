const nodemailer = require("nodemailer");
const capitalizeString = require("../utils/capitalize.utils");

module.exports.sendMail = async (reqUser, recipient, subject, content) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.MAIL_ADDRESS,
    to: recipient,
    subject: subject,
    sender: "The Bale Team",
    html: `<!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      </head>
      <body style="font-family: sans-serif;">
        <div style="display: block; margin: auto; max-width: 600px;" class="main">
            <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">Hello, ${capitalizeString(
              reqUser.fullname
            )}!</h1>
            ${content}
            <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">The Bale Team</h1>
              </div>
              <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
              <style>
                .main { background-color: white; }
                a:hover { border-left-width: 1em; min-height: 2em; }
              </style>
            </body>
          </html>`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log(`Email successfully sent to ${recipient}`);
    }
  });
};
