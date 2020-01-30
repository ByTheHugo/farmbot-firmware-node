"use strict";

export interface ConfigAreaInterface {
  origin: PositionInterface;
  size: SizeInterface;
  owners: Array<string>;
}

export interface PositionInterface {
  x: number;
  y: number;
}

export interface SizeInterface {
  length: number;
  width: number;
}
