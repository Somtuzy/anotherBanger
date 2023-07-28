const bcrypt = require("bcrypt");

exports.hashPassword = async (passwordInput) => {
  const salt = await bcrypt.genSalt(parseFloat(process.env.ROUNDS));
  return await bcrypt.hash(passwordInput, salt);
};
exports.verifyPassword = async (passwordInput, hashedPassword) => {
  return await bcrypt.compare(passwordInput, hashedPassword);
};
