import type { BunRequest } from "bun";
import { api } from "system/server/parts/api/index";
import { g } from "../global";
import { pack, unpack } from "msgpackr";

export const serveApiRoutes = () => {
  const routes = {} as Record<string, any>;
  for (const [_, route] of Object.entries(api)) {
    routes[route.path] = async (req: BunRequest) => {
      const server = g.server;
      let args: any = [];
      if (req.method === "POST") {
        args =
          route.msgpack !== false
            ? (unpack(new Uint8Array(await req.arrayBuffer())) as unknown[])
            : await req.json();
      }
      const ip_addr = server.requestIP(req);

      let result = null;
      if (args.length === 0) {
        result = await (route.handler as any).call(
          {
            req,
            ip:
              ip_addr?.family === "IPv4"
                ? ip_addr.address
                : ip_addr?.address.split("").pop(),
          },
          {}
        );
      } else {
        result = await (route.handler as any).call(
          { req, ip: ip_addr?.address.split("").pop() },
          ...(args as Parameters<typeof route.handler>)
        );
      }

      const headers = result?.headers ?? false;
      if (headers) delete result.headers;
      // If response is already a Response object, just add CORS headers
      if (result instanceof Response) {
        return result;
      }

      // Create response and preserve headers from API result
      const response =
        route.msgpack === false
          ? Response.json(result)
          : new Response(pack(result), {
              headers: {
                "Content-Type": "application/msgpack",
              },
            });

      // If the handler returned headers, add them to the response
      if (headers) {
        const headerEntries = Object.entries(headers);
        for (const [key, value] of headerEntries) {
          response.headers.set(key, value as string);
        }
      }

      return response;
    };
  }
  return routes;
};
