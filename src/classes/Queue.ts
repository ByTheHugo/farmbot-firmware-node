"use strict";
import { logger } from "../app";
import { TaskInterface } from "./../types/TaskInterface";
import { Procedure } from "./Procedure";
import procedureMap = require("ProcedureMap");

export class Queue {
  private elements: Array<any>;
  private ready: boolean = true;
  private timeout = 100;

  constructor(...elements: any) {
    this.elements = [...elements];
  }
  public push(...args: any) {
    logger.debug("Queue.ts push - " + args);
    return this.elements.push(...args);
  }
  public shift() {
    return this.elements.shift();
  }
  public length(): number {
    return this.elements.length as number;
  }
  public process(): void {
    if (this.elements.length === 0) return;
    if (!this.ready) return;
    const self = this;
    this.ready = false;
    logger.debug("Queue.ts - process()");

    //
    // Queue actions
    //
    // 0. Get task
    const task: TaskInterface = this.shift();
    if (!task || !task.call || !task.id) {
      logger.info("Received misformed task, ignoring it...");
      return;
    }

    // 1. Find procedure in folder
    const procedure_name: string = task.call.method.charAt(0).toUpperCase() + task.call.method.slice(1) + "Procedure";
    const procedure_class = require("../procedures/" + procedure_name)[procedure_name];
    if (!procedure_class) {
      logger.info("Procedure " + procedure_name + " not found, ignoring task...");
      return;
    }

    // 2. Save call before running procedure
    const procedure = new procedure_class();
    procedure.set_call(task.call).run().then(() => {
      self.ready = true;
    }, (e: string) => {
      self.ready = true;
      logger.error(e);
    });
  }
}
