require("express-async-errors");
const logger = require("pino")();

const { app } = require("./app");

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`listening on port ${PORT}`);
});
