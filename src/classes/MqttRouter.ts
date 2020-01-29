"use strict";
import { mqtt_client } from "../app";
//
let handlers: HandlerInterface = {};
interface HandlerInterface {
  [url: string]: Handler;
}
//
export function clear() {
  handlers = {};
}
export function register(url: string, method: Function) {
  mqtt_client.subscribe(url);
  handlers[url] = createHandler(method);
}
export function route(topic: string) {
  return handlers[topic];
}
//
function createHandler(method: Function) {
  return new Handler(method);
}
class Handler {
  method: Function;
  constructor(method: Function) {
    this.method = method;
  }
  process(message: Buffer) {
    let parsed_message = undefined;
    try {
      parsed_message = JSON.parse(message.toString());
    } catch (e) {
      // Maybe
    } finally {
      if (parsed_message)
        this.method(parsed_message);
    }
  }
}
