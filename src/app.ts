import { ProcedureCallInterface } from "ProcedureCallInterface";
import * as dotenv from "dotenv";
import * as winston from "winston";
import * as path from "path";
import * as fs from "fs";
import * as YAML from "yaml";
import * as mqtt from "mqtt";
import * as mqttRouter from "./classes/MqttRouter";
import { Queue } from "./classes/Queue";
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
let conf_string: string;
try {
  conf_string = fs.readFileSync(path.join(process.env.CONFIG_DIRECTORY, "farmbot.yaml"), "utf8");
} catch (e) {
  logger.error(e.message);
  exitHandler();
}
const conf: any = YAML.parse(conf_string);
const queue: Queue = new Queue();
//
// Connect to MQTT Broker
const mqtt_client: mqtt.MqttClient = mqtt.connect(
  conf.broker.host,
  { "clientId": process.env.APP_NAME, "username": conf.broker.username, "password": conf.broker.password }
);
//
// MQTT Listeners
mqtt_client.on("connect", function () {
  logger.info("[MQTT] Successfuly connected to MQTT broker %s!", conf.broker.host);
  //
  // Register MQTT procedures
  // mqttRouter.register(process.env.MQTT_CLIENT_NAME + "/in/move", MoveProcedure.do);
});
mqtt_client.on("reconnect", function () {
  logger.info("[MQTT] Lost connection to the MQTT broker %s. Trying to reconnect...", conf.broker.host);
});
mqtt_client.on("error", function (e) {
  logger.error(e.message);
  mqtt_client.end(false, undefined, exitHandler);
});
mqtt_client.on("message", function (topic, message: ProcedureCallInterface) {
  logger.debug("[MQTT] " + topic + ": " + message.toString());

  //const handler = mqttRouter.route(topic);
  // if (handler)
  //  handler.process(message);

  queue.push({
    id: Date.now(),
    call: message
  });
});
//
// Exported variables
export { logger, mqtt_client, conf, queue };
//
logger.info("Farmbot firmware started");
