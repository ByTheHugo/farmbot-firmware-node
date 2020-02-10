"use strict";
import { conf, logger } from "../app";
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
        logger.debug("Sequence.ts - NotFoundError");
        return reject(new NotFoundError());
      }

      fs.readFile(fpath, (err: Error, data: Buffer) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(new Sequence(name, data.toString().trim().split(endOfLine)));
        }
      });
    });
  }

  public fill(args: Object): Sequence {
    for (let i = 0; i < this.gcode_ary.length; i++) {

      const config_matches = this.gcode_ary[i].match(/\[(\w+\.)+\w+\]/gi);
      if (!config_matches) return this;

      for (let y = 0; y < config_matches.length; y++) {
        const local_key: Array<string> = config_matches[y].slice(1, config_matches[y].length - 1).split(".");
        let local_value: any;

        if (local_key[0] === "conf") {
          local_value = conf;
        } else if (local_key[0] === "args") {
          local_value = args;
        }
        local_key.shift();

        local_key.forEach(key => {
          if (!local_value[key]) {
            logger.debug("Sequence.ts - MissingParameterError");
            throw new MissingParameterError();
          }
          local_value = local_value[key];
        });

        this.gcode_ary[i] = this.gcode_ary[i].replace(config_matches[y], local_value).trim();
      }
    }
    return this;
  }

  public async play(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.gcode_ary.forEach(elem => {
        logger.debug("Playing " + elem);
        return resolve(true);
      });
    });
  }
}
