const capitalizeString = require("../utils/capitalize.utils");

module.exports.isLoggedIn = (req, res) => {
  const greetUser = (user) => {
    // Create a new Date object
    const currentTime = new Date();

    // Get the current hour, minute, and second
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let seconds = currentTime.getSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";
    let greetUser;

    if (hours >= 0 && hours < 12) {
      greetUser = `Good morning, ${capitalizeString(user)}.`;
    }

    if (hours >= 12 && hours < 16) {
      greetUser = `Good afternoon, ${capitalizeString(user)}.`;
    }

    if (hours >= 16 && hours < 24) {
      greetUser = `Good evening, ${capitalizeString(user)}.`;
    }

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;

    // Format the time as a string
    let timeString = hours + ":" + minutes + ":" + seconds + " " + ampm;

    // Print the current time
    console.log(`${greetUser}.`);

    return res.status(200).json({
      message: `${greetUser}.`,
      lastLogin: `${timeString}`,
    });
  };
  console.log(req.session.cookie.user);
  req.user = req.session.cookie.user;

  if (!req.user) {
    return greetUser("thrifter");
  }

  return greetUser(req.user.fullname);
};
