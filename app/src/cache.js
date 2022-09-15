const config = require("config");

const memjs = require("memjs");

const mc = memjs.Client.create(
  `${config.get("cache.host")}:${config.get("cache.port")}`,
  {
    username: config.get("cache.username"),
    password: config.get("cache.password"),
    failoverTime: 30,
    retries: 0,
  }
);

module.exports = mc;
