import { api } from "@/lib/generated/api";
import { proxy, ref, useSnapshot } from "valtio";

const authProxy = proxy({
  state: {
    status: "loading" as "loading" | "logged-in" | "logged-out",
    home: "/",
    user: {
      id: "",
      username: "",
      fullname: "",
    },
    role: {
      id: "",
      name: "",
    },
    session: {
      id: "",
    },
  },
  action: ref({
    async init() {
      const check = await api.authCheck();
      if (check.error) {
        authProxy.state.status = "logged-out";
        console.warn(`[AUTH] ${check.error}`);
      } else if (check.user) {
        authProxy.state.user = check.user;
        authProxy.state.role = check.role;
        authProxy.state.session = check.session;
        authProxy.state.status = "logged-in";
      }
      return check;
    },
    async login(opt: { username: string; password: string }) {
      const res = await api.authLogin(opt);
      return res;
    },
    async logout() {
      await api.authLogout();
    },
    async register(opt: {}) {},
  }),
});

export function useAuth() {
  return useSnapshot(authProxy);
}
