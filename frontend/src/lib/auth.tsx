import { Logo } from "@/components/app/logo";
import { Spinner } from "@/components/ui/spinner";
import React from "react";
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
    init() {},
    async login(opt: { username: string; password: string }) {},
    logout() {},
    async register(opt: {}) {},
  }),
});

export function useAuth() {
  return useSnapshot(authProxy);
}

// Store and retrieve redirect path
export const storeRedirectPath = (path: string) => {
  sessionStorage.setItem("redirectPath", path);
};

export const getStoredRedirectPath = () => {
  const path = sessionStorage.getItem("redirectPath");
  sessionStorage.removeItem("redirectPath"); // Clear it after getting it
  return path;
};

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center flex-col w-full h-full space-y-[10px]">
        <Spinner className="w-[30px] h-[30px] opacity-50" />
        <Logo />
      </div>
    );
  }

  if (state.status === "logged-in") {
    window.location.href = state.home;
    return null;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (state.status === "logged-out") {
    storeRedirectPath(window.location.pathname);
    window.location.href = "/auth/login";
    return null;
  }

  return <>{children}</>;
}
