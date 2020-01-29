export interface MqttProcedureMessageInterface {
  readonly method: string;
  readonly params: Array<string>;

  readonly username?: string;
  readonly password?: string;
}
