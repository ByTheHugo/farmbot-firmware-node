"use strict";
export class ErrorWithCode extends Error {
    message: string;
    code: number;
    http: number;
    error: Error;
    //
    constructor(m: string, h: number = 500, c: number = 0, e: Error = undefined) {
        super(m);
        this.message = m;
        this.code = c;
        this.http = h;
        this.error = typeof e != "undefined" ? e : undefined;

        Object.setPrototypeOf(this, ErrorWithCode.prototype);
    }
    //
    toJson(): Object {
        if (this.error && process.env.APP_ENV == "dev") {
            return { error: { code: this.code, msg: this.message, err: this.error }, date: Date.now() };
        } else {
            return { error: { code: this.code, msg: this.message }, date: Date.now() };
        }
    }
}