"use strict";
import { conf } from "../app";
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

  public fill(args: Object): Sequence {
    for (let i = 0; i < this.gcode_ary.length; i++) {

      const config_matches = this.gcode_ary[i].match(/\[(\w+\.)+\w\]/gi);
      for (let y = 0; y < config_matches.length; y++) {
        const local_key: Array<string> = config_matches[y].slice(1, config_matches[y].length - 1).split(".");
        let local_value: any;

        if (local_key[0] === "conf") {
          local_value = conf;
        } else if (local_key[0] === "args") {
          local_value = args;
        }
        for (const key in local_key) {
          if (!local_value[key]) throw new MissingParameterError();
          local_value = local_value[key];
        }

        this.gcode_ary[i] = this.gcode_ary[i].replace(config_matches[y], local_value);
      }
    }
    return this;
  }

  public async play(): Promise<boolean> {
    return new Promise((resolve, reject) => {

    });
  }
}
