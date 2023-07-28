const _ = require("lodash");

const validator =
  (schema, source = "body") =>
  async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req[source]);
      if (source === "body") {
        req._body = req?.body; // for debugging purposes
        req.body = value; // validated value
      }
      if (source === "query") {
        req._query = req?.query; // for debugging purposes
        req.query = value; // validated value
      }
      return next();
    } catch (err) {
        return res.status(500).json({
          message: err.message,
          success: false,
        });
    }
  };

module.exports = validator;
