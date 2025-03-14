import { authBackend } from "system/auth/backend";
import { apiContext, defineAPI } from "system/server/parts/api/define";

export default defineAPI({
  path: "/api/auth/logout",
  msgpack: false,
  handler: async function () {
    const { req } = apiContext(this);
    const cookies = req.headers.get("Cookie") ?? "";
    // Get the last sessionId value (most recent) from potential multiple cookies
    const sessionId = cookies
      .split(";")
      .reverse()
      .find((cookie) => cookie.trim().startsWith("sessionId="))
      ?.split("=")?.[1]
      ?.trim();

    if (!sessionId) {
      return { error: "No session found in cookies" };
    }

    try {
      const session = await authBackend.model.session.findFirst({
        where: [
          { field: "id", operator: "=", value: sessionId },
          { field: "status", operator: "=", value: "active" },
        ],
        fields: ["id"],
      });

      if (session) {
        await authBackend.model.session.save({
          data: { id: sessionId, status: "inactive" },
        });
        return {
          headers: {
            "Set-Cookie": `sessionId=; HttpOnly; Path=/; Max-Age=${
              30 * 24 * 60 * 60
            }; ${
              process.env.NODE_ENV === "production" ? "Secure; " : ""
            }SameSite=Lax`,
          },
        };
      }
    } catch (error) {
      console.error("Session check error:", error);
      return { error: "Failed to verify session" };
    }

    // try {
    //   const userModel = authBackend.modelName.user;
    //   const roleModel = authBackend.modelName.role;
    //   const userMapping = authBackend.config.mapping.user.fields;
    //   const roleMapping = authBackend.config.mapping.role.fields;

    //   const fields = Object.entries(userMapping)
    //     .filter(([k]) => {
    //       if (k === "password" || k === "role_id") return false;
    //       return true;
    //     })
    //     .map(([k, v]) => v);

    //   if (!session) {
    //     return { error: `Invalid or expired session: ${sessionId}` };
    //   }

    //   const userSession = session[userModel];
    //   if (userSession) {
    //     const user = {
    //       id: userSession[userMapping.id],
    //       fullname: userSession[userMapping.fullname],
    //       username: userSession[userMapping.username],
    //     };

    //     const role = {
    //       id: userSession[roleModel][roleMapping.id],
    //       name: userSession[roleModel][roleMapping.name],
    //     };
    //     return { user, role, session: { id: session.id } };
    //   }

    //   return { error: `Session not found: ${sessionId}` };
  },
});
