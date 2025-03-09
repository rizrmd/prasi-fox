import { authBackend } from "system/auth/backend";
import { apiContext, defineAPI } from "system/server/parts/api/define";

export default defineAPI({
  path: "/api/auth/check",
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
      const userModel = authBackend.modelName.user;
      const userMapping = authBackend.config.mapping.user.fields;

      const fields = Object.entries(userMapping)
        .filter(([k]) => {
          if (k === "password" || k === "role_id") return false;
          return true;
        })
        .map(([k, v]) => v);

      const session = await authBackend.model.session.findFirst({
        where: [
          { field: "id", operator: "=", value: sessionId },
          { field: "status", operator: "=", value: "active" },
        ],
        fields: ["id", [authBackend.modelName.user, ...fields]],
      });

      if (!session) {
        return { error: `Invalid or expired session: ${sessionId}` };
      }

      const userSession = session[userModel];
      if (userSession) {
        const user = {
          id: userSession[userMapping.id],
          fullname: userSession[userMapping.fullname],
          username: userSession[userMapping.username],
          role: userSession[userMapping.role],
        };

        return { user, session: { id: session.id } };
      }

      return { error: `Session not found: ${sessionId}` };
    } catch (error) {
      console.error("Session check error:", error);
      return { error: "Failed to verify session" };
    }
  },
});
