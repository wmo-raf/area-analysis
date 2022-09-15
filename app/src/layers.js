const yaml = require("js-yaml");
const fs = require("fs");
const logger = require("logger");

const config = require("config");

const configYamlFile = config.get("layers.configYamlFile");

let layerConfig = {};

if (!fs.existsSync(configYamlFile)) {
  const message = `Layers configuration file not found in given path: ${configYamlFile}`;
  logger.error(message);
  process.exit(1);
}

if (configYamlFile && fs.existsSync(configYamlFile)) {
  layerConfig = yaml.load(
    fs.readFileSync(configYamlFile, { encoding: "utf-8" })
  );
}

module.exports = layerConfig;
