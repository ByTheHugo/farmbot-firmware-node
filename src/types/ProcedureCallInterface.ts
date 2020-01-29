"use strict";
export interface ProcedureCallInterface {
  readonly method: string;
  readonly args?: ProcedureArgumentsInterface;
  readonly auth?: ProcedureAuthenticationInterface;
}

export interface ProcedureAuthenticationInterface {
  readonly username: string;
  readonly password: string;
}

export interface ProcedureArgumentsInterface {
  [key: string]: any;
}
