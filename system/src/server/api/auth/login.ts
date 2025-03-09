import crypto from "crypto";
import { authBackend } from "system/auth/backend";
import { translate } from "system/lang/translate";
import { apiContext, defineAPI } from "system/server/parts/api/define";

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

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export default defineAPI({
  path: "/api/auth/login",
  handler: async function (opt: { username: string; password: string }) {
    const { username, password } = opt;
    const { req, ip } = apiContext(this);

    const mapping = authBackend.config.mapping.user.fields;
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

      const pk = authBackend.model.user.primaryKey;
      const user = await authBackend.model.user.findFirst({
        fields: [pk, ...fields],
        where: [
          {
            field: mapping.username,
            operator: "ILIKE",
            value: username,
          },
        ],
      });

      if (user) {
        let passwordVerified = false;
        if (user.password === null) {
          await authBackend.model.user.save({
            data: {
              [pk]: user[pk],
              [mapping.password]: hashPassword(password),
            },
          });
          passwordVerified = true;
        } else {
          passwordVerified = verifyPassword(password, user.password);
        }

        if (passwordVerified) {
          const mapping = authBackend.config.mapping.session.fields;
          const session = await authBackend.model.session.save({
            data: {
              [mapping.user_id]: user.id,
              [mapping.status]: "active",
            },
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
      }
      return {
        error: translate("auth_failed_login", {
          params: mapping,
          capitalizedParams: true,
        }),
      };
    } catch (error) {
      console.log(error);
      return { error: translate("auth_failed") };
    }
  },
});
