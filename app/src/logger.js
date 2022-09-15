const config = require("config");
const bunyan = require("bunyan");
const bformat = require("bunyan-format");

const formatOut = bformat({ outputMode: "short" });

const streams = [
  {
    stream: formatOut,
    level: config.get("logger.level") || "debug",
  },
  {
    stream: formatOut,
    level: "warn",
  },
];

if (config.get("logger.toFile")) {
  streams.push({
    level: config.get("logger.level") || "debug",
    path: config.get("logger.dirLogFile"),
  });
}

const logger = bunyan.createLogger({
  name: config.get("logger.name"),
  src: true,
  streams,
});

module.exports = logger;
