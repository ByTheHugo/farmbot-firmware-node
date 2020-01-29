"use strict";
import { MqttProcedureArgumentsInterface } from "./MqttProcedureArgumentsInterface";

export interface MqttProcedureProcessInterface {
  (params: MqttProcedureArgumentsInterface): boolean;
}
