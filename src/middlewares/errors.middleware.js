const logger = require('pino')();

module.exports = (error, req, res, next) => {
  logger.error(error);

  return res.status(500).json({
    success: false,
    message: error.message
  });
};