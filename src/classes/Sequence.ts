"use strict";
import { MissingParameterError } from "./../errors/MissingParameterError";
import { NotFoundError } from "./../errors/NotFoundError";
import * as fs from "fs";
import * as path from "path";
const endOfLine = require("os").EOL;

export class Sequence {
  public readonly name: string;
  private gcode_ary: Array<string>;

  public constructor(name: string, gcode_ary: Array<string>) {
    this.name = name;
    this.gcode_ary = gcode_ary;
  }

  public static async get(name: string): Promise<Sequence> {
    return new Promise((resolve, reject) => {
      const fpath: string = path.join(process.env.SEQUENCE_DIRECTORY, name + ".nc");
      if (!fs.existsSync(fpath)) {
        return reject(new NotFoundError());
      }

      fs.readFile(fpath, "utf8", (err: Error, data: string) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(new Sequence(name, data.split(endOfLine)));
        }
      });
    });
  }

  public fill(params: Array<string>): Sequence {
    let p: number = 0;
    for (let i = 0; i < this.gcode_ary.length; i++) {
      const param_required: number = this.gcode_ary[i].match(/\?/g).length;
      if (param_required > params.length) {
        throw new MissingParameterError();
      }
      for (let y = 0; y < param_required; y++) {
        this.gcode_ary[i].replace(/\?/, params[p]);
        p += 1;
      }
    }
    return this;
  }

  public async play(): Promise<boolean> {
    return new Promise((resolve, reject) => {

    });
  }
}
