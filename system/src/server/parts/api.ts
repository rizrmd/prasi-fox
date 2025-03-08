import type { BunRequest, Server } from "bun";
import { api } from "../api";
import { g } from "./global";

export const defineAPI = <
  T extends string,
  K extends (...arg: any[]) => Promise<any>
>(opt: {
  path: T;
  handler: K;
}) => {
  return opt;
};

export const apiContext = (arg: any) => {
  return arg as { req: BunRequest; ip: string };
};
