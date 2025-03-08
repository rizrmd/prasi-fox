import type { BunRequest } from "bun";
import { api } from ".";
import { g } from "../parts/global";

export const serveApiRoutes = () => {
  const routes = {} as Record<string, any>;
  for (const [_, value] of Object.entries(api)) {
    routes[value.path] = async (req: BunRequest) => {
      const server = g.server;
      let args: any = [];
      if (req.method === "POST") {
        args = (await req.json()) as unknown[];
      }
      const ip_addr = server.requestIP(req);

      let result = null;
      if (args.length === 0) {
        result = await (value.handler as any).call(
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
        result = await (value.handler as any).call(
          { req, ip: ip_addr?.address.split("").pop() },
          ...(args as Parameters<typeof value.handler>)
        );
      }

      // If response is already a Response object, just add CORS headers
      if (result instanceof Response) {
        return result;
      }

      // Create response and preserve headers from API result
      const response = Response.json(result);

      // If the handler returned headers, add them to the response
      if (result && typeof result === "object" && "headers" in result) {
        const headerEntries = Object.entries(result.headers);
        for (const [key, value] of headerEntries) {
          response.headers.set(key, value as string);
        }
        // Remove headers from the JSON response
        delete (result as any).headers;
      }

      return response;
    };
  }
  return routes;
};
