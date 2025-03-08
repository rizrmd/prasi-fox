import crypto from "crypto";
import { Auth } from "system/config/auth";
import { translate } from "system/lang/translate";
import { apiContext, defineAPI } from "system/server/parts/api";

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (salt) {
    const testHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return hash === testHash;
  }
  return false;
}

export default defineAPI({
  path: "/auth/login",
  handler: async function (opt: { username: string; password: string }) {
    const { username, password } = opt;
    const { req, ip } = apiContext(this);

    const mapping = Auth.config.mapping.user.fields;
    if (!username || !password) {
      return {
        error: translate("auth_missing_fields", {
          params: mapping,
          capitalizedParams: true,
        }),
      };
    }

    try {
      const fields = Object.values(mapping);

      const user = await Auth.model.user.findFirst({
        fields: [
          Auth.model.user.primaryKey,
          ...fields,
          [Auth.modelName.role, "name"],
        ],
        where: [
          {
            field: mapping.username,
            operator: "ILIKE",
            value: username,
          },
        ],
      });

      if (user) {
        if (verifyPassword(password, user.password)) {
          const session = await Auth.model.session.save({
            user_id: user.id,
            status: "active",
          });

          return {
            user,
            headers: {
              "Set-Cookie": `sessionId=${
                session.id
              }; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; ${
                process.env.NODE_ENV === "production" ? "Secure; " : ""
              }SameSite=Lax`,
            },
          };
        }
      } else {
        return {
          error: translate("auth_failed_login", {
            params: mapping,
            capitalizedParams: true,
          }),
        };
      }
    } catch (error) {
      console.log(error);
      return { error: translate("auth_failed") };
    }
  },
});
