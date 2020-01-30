"use strict";
import { conf } from "../app";
import { AuthenticationMethod } from "AuthenticationMethodEnum";
import { ProcedureCallInterface } from "ProcedureCallInterface";
import { NotAllowedError } from "../errors/NotAllowedError";
import { Sequence } from "./Sequence";
import { CallNotSetError } from "../errors/CallNotSetError";

export abstract class Procedure {
  abstract readonly name: string;
  abstract readonly auth_method: AuthenticationMethod = AuthenticationMethod.IS_ADMIN_OR_OWNER;
  protected sequences_to_run: Array<Sequence> = [];
  protected call: ProcedureCallInterface;

  private is_allowed(): boolean {
    switch (this.auth_method) {
      case AuthenticationMethod.NONE:
        return true;
      case AuthenticationMethod.IS_ADMIN:
        return this.call.auth.username && conf.users[this.call.auth.username].role && conf.users[this.call.auth.username].role === "admin";
      case AuthenticationMethod.IS_OWNER:
        return this.call.auth.username && this.call.args.area && conf.areas[this.call.args.area] && conf.areas[this.call.args.area].owners.indexOf() >= 0;
      case AuthenticationMethod.IS_ADMIN_OR_OWNER:
        return this.call.auth.username && conf.users[this.call.auth.username].role && this.call.args.area && conf.areas[this.call.args.area] && conf.users[this.call.auth.username].role === "admin" && conf.areas[this.call.args.area].owners.indexOf() >= 0;
      default:
        return false;
    }
  }
  public async run(): Promise<any> {
    if (!this.call) {
      throw new CallNotSetError();
    }
    if (!this.is_allowed()) {
      throw new NotAllowedError();
    } else {
      await this.do();
    }
  }
  public set_call(call: ProcedureCallInterface): Procedure {
    this.call = call;
    return this;
  }

  abstract async do(): Promise<any>;
  abstract callback(ret: string): void;
}
