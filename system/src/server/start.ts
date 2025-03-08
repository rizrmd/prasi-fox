import { Auth } from "system/config/auth";
import { serveApiRoutes } from "./api/serve";
import { g } from "./parts/global";

interface ServerOptions {
  port: number;
  hostname: string;
}

export async function startServer(
  options: ServerOptions = { port: 4600, hostname: "0.0.0.0" }
) {
  const { port, hostname } = options;

  Auth.init();

  const routes = serveApiRoutes();
  g.server = Bun.serve({
    port,
    hostname,
    routes,
    async fetch(req) {
      return new Response(JSON.stringify({ service: "running" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });

  console.log(`Server started at http://${hostname}:${port}`);
}

// Start the server if this file is executed directly
if (import.meta.path === Bun.main) {
  startServer();
}
