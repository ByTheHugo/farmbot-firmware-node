"use strict";

export class Queue {
  private elements: Array<any>;

  constructor(...elements: any) {
    this.elements = [...elements];
  }
  push(...args: any) {
    return this.elements.push(...args);
  }
  shift() {
    return this.elements.shift();
  }
  length() {
    return this.elements.length;
  }
}
