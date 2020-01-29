"use strict";
import { MqttProcedureProcessInterface } from "MqttProcedureProcessInterface";
import { MqttProcedureArgumentsInterface } from "MqttProcedureArgumentsInterface";

export class MqttProcedure {
  name: string;
  params: MqttProcedureArgumentsInterface;
  process: MqttProcedureProcessInterface;
}
