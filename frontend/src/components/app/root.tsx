import { GlobalAlert } from "@/components/ui/global-alert";
import { ParamsContext, useRoot } from "@/lib/router";
import { Toaster } from "../ui/sonner";
import { AppLoading } from "./app-loading";
import { Layout } from "./layout";

import "@/index.css";

function AppContent() {
  const { Page, currentPath, isLoading, params } = useRoot();

  if (isLoading) {
    return <AppLoading />;
  }

  if (currentPath.startsWith("/auth")) {
    return (
      <>
        {Page ? (
          <ParamsContext.Provider value={params}>
            {<Page />}
          </ParamsContext.Provider>
        ) : (
          <div>Page not found</div>
        )}
      </>
    );
  }

  return (
    <ParamsContext.Provider value={params}>
      <Layout>{Page ? <Page /> : <div>Page not found</div>}</Layout>
    </ParamsContext.Provider>
  );
}

export function Root() {
  return (
    <>
      <GlobalAlert />
      <Toaster />
      <AppContent />
    </>
  );
}
