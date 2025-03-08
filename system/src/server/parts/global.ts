import type { Server } from "bun";

export const g = global as unknown as {
  server: Server;
};
