"use strict";
import { conf } from "../app";
import { AuthenticationMethod } from "AuthenticationMethodEnum";
import { ProcedureCallInterface } from "ProcedureCallInterface";
import { NotAllowedError } from "../errors/NotAllowedError";

export abstract class Procedure {
  abstract readonly name: string;
  abstract readonly auth_method: AuthenticationMethod = AuthenticationMethod.IS_ADMIN_OR_OWNER;

  private is_allowed(call: ProcedureCallInterface): boolean {
    switch (this.auth_method) {
      case AuthenticationMethod.NONE:
        return true;
      case AuthenticationMethod.IS_ADMIN:
        return call.auth.username && conf.users[call.auth.username].role && conf.users[call.auth.username].role === "admin";
      case AuthenticationMethod.IS_OWNER:
        return call.auth.username && call.args.area && conf.areas[call.args.area] && conf.areas[call.args.area].owners.indexOf() >= 0;
      case AuthenticationMethod.IS_ADMIN_OR_OWNER:
        return call.auth.username && conf.users[call.auth.username].role && call.args.area && conf.areas[call.args.area] && conf.users[call.auth.username].role === "admin" && conf.areas[call.args.area].owners.indexOf() >= 0;
      default:
        return false;
    }
  }
  public async run(call: ProcedureCallInterface): Promise<any> {
    if (!this.is_allowed(call)) {
      throw new NotAllowedError();
    } else {
      await this.do(call);
    }
  }

  abstract async do(call: ProcedureCallInterface): Promise<any>;
}
