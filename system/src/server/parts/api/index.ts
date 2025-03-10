import authCheck from "system/server/api/auth/check";
import authLogin from "system/server/api/auth/login";
import authLogout from "system/server/api/auth/logout";
import model from "system/server/api/model";

export const api = { authCheck, authLogin, authLogout, model };
