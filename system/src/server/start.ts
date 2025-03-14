import type { ServeOptions, WebSocketHandler } from "bun";
import { authBackend } from "system/auth/backend";
import { color as clr } from "system/cli/color";
import { handleFrontendProxy } from "./frontend/proxy";
import { buildFrontend, runFrontendDev } from "./frontend/run";
import { serveStatic } from "./frontend/static";
import { watchPageRoutes } from "./frontend/watch-page";
import { buildApis } from "./parts/api/build";
import { serveApiRoutes } from "./parts/api/serve";
import { watchApis } from "./parts/api/watch";
import { checkDatabaseConnection } from "./parts/db";
import { g } from "./parts/global";

interface ServerOptions {
  port: number;
  hostname: string;
}

const isDev = process.argv.includes("--dev");

export async function startServer(
  options: ServerOptions = { port: 4600, hostname: "0.0.0.0" }
) {
  const { port, hostname } = options;

  authBackend.init();

  const routes = serveApiRoutes();
  if (isDev) {
    if (!g.server) {
      watchPageRoutes();
      runFrontendDev();
      watchApis();

      setTimeout(async () => {
        try {
          await checkDatabaseConnection();
          console.log(`${clr.green}Database connected${clr.esc}`);
        } catch (e) {
          console.log(`${clr.red}Database connection failed${clr.esc}`);
          console.error(e);
        }
      }, 100);
    }
  } else {
    await buildFrontend();
    await buildApis();
  }
  g.server = Bun.serve({
    port,
    hostname,
    routes,
    websocket: {
      async message(ws, message) {},
      close(ws) {},
    },
    async fetch(req, server) {
      if (server.upgrade(req, { data: { url: req.url } })) {
        return;
      }

      if (isDev) {
        const fe = await handleFrontendProxy(req);
        if (fe.status === 200) {
          return fe;
        }
      } else {
        const fe = await serveStatic(req);
        if (fe.status === 200) {
          return fe;
        }
      }

      return new Response(JSON.stringify({ service: "running" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  } as ServeOptions & { websocket: WebSocketHandler<{ url: string }> });

  console.log(
    `Server started at ${clr.blue}http://localhost:${port}${clr.esc} [host: ${hostname}]`
  );
}

// Start the server if this file is executed directly
if (import.meta.path === Bun.main) {
  startServer();
}
