"use strict";
import { conf, logger } from "../app";
import { AuthenticationMethod } from "../types/AuthenticationMethodEnum";
import { ProcedureCallInterface } from "../types/ProcedureCallInterface";
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
        return this.call.auth.username && this.call.args.area && conf.areas[this.call.args.area] && conf.areas[this.call.args.area].owners.indexOf(this.call.auth.username) >= 0;
      case AuthenticationMethod.IS_ADMIN_OR_OWNER:
        return this.call.auth.username && conf.users[this.call.auth.username].role && this.call.args.area && conf.areas[this.call.args.area] && conf.users[this.call.auth.username].role === "admin" && conf.areas[this.call.args.area].owners.indexOf(this.call.auth.username) >= 0;
      default:
        return false;
    }
  }
  public async run(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.call) {
        logger.debug("Procedure.run: CallNotSetError()");
        throw new CallNotSetError();
      }
      if (!this.is_allowed()) {
        logger.debug("Procedure.run: NotAllowedError()");
        throw new NotAllowedError();
      } else {
        await this.do();
        this.sequences_to_run.forEach(async (sequence: Sequence) => {
          await sequence.play();
        });
        return resolve();
      }
    });
  }
  public set_call(call: ProcedureCallInterface): Procedure {
    this.call = call;
    return this;
  }

  abstract async do(): Promise<any>;
  abstract callback(ret: string): void;
}
