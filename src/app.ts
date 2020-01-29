import * as dotenv from "dotenv";
import * as winston from "winston";
import * as path from "path";
import * as fs from "fs";
import * as YAML from "yaml";
import * as mqtt from "mqtt";
import * as mqttRouter from "./classes/MqttRouter";
//
let mqtt_client: mqtt.MqttClient = undefined;
//
// ===============================================
// SETUP APP WITH ENV
// ===============================================
//
// Load environment variables from .env file
dotenv.config({ path: ".env" });
//
// Configure app logger
const logger: winston.LoggerInstance = new winston.Logger({
  transports: [
    new (winston.transports.File)({
      name: "logs",
      filename: path.resolve(process.env.LOG_PATH),
      level: process.env.LOG_LEVEL
    }),
    new (winston.transports.Console)({
      level: "debug",
      handleExceptions: true,
      json: true
    })
  ],
  exitOnError: true
});
//
// Create exit handler for error or user
const exitHandler = function () {
  logger.info("App now exiting...");
  if (mqtt_client) mqtt_client.end();
  process.exit();
};
//
// process.on("exit", exitHandler); // do something when app is closing
process.on("SIGINT", exitHandler); // catches ctrl+c event
// process.on("SIGUSR1", exitHandler); // catches "kill pid" (for example: nodemon restart)
// process.on("SIGUSR2", exitHandler); // catches "kill pid" (for example: nodemon restart)
process.on("uncaughtException", exitHandler); // catches uncaught exceptions
//
// ===============================================
// SETUP APP WITH CONF
// ===============================================
fs.readFile(path.join(process.env.CONFIG_DIRECTORY, "farmbot.yaml"), "utf8", (err: Error, conf_string: string) => {
  if (err) {
    logger.error(err.message);
    return exitHandler();
  }
  const conf: any = YAML.parse(conf_string);
  //
  // Connect to MQTT Broker
  mqtt_client = mqtt.connect(
    conf.broker.host,
    { "clientId": process.env.APP_NAME, "username": conf.broker.username, "password": conf.broker.password }
  );
  //
  // MQTT Listeners
  mqtt_client.on("connect", function () {
    logger.info("[MQTT] Successfuly connected to MQTT broker %s!", conf.broker.host);
    //
    // Register MQTT procedures
    // mqttRouter.register(process.env.MQTT_CLIENT_NAME + "/say", sayController.say);
  });
  mqtt_client.on("reconnect", function () {
    logger.info("[MQTT] Lost connection to the MQTT broker %s. Trying to reconnect...", conf.broker.host);
  });
  mqtt_client.on("error", function (e) {
    logger.error(e.message);
    mqtt_client.end(false, exitHandler);
  });
  mqtt_client.on("message", function (topic, message) {
    logger.debug("[MQTT] " + topic + ": " + message.toString());
    const handler = mqttRouter.route(topic);
    if (handler)
      handler.process(message);
  });
  //
  logger.info("Configuration successfuly loaded");
});
//
// Exported variables
export { logger, mqtt_client };
//
logger.info("Farmbot firmware started");
