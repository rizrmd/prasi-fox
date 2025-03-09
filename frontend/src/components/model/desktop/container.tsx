import { AppLoading } from "@/components/app/app-loading";
import { ProtectedRoute } from "@/lib/auth";
import type { FC, ReactNode } from "react";
import { useSnapshot } from "valtio";
import { ModelBreadAction } from "./bread/bread-action";
import { ModelBreadList } from "./bread/bread-list";
import { ModelNavTabs } from "./nav-tabs";
import { useValtioTab } from "@/hooks/use-valtio-tab";

export const ModelContainer: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { write: tabs } = useValtioTab();
  const manager = useSnapshot(tabs);

  if (manager.state.status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <AppLoading />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col flex-1 bg-slate-100 select-none">
        <ModelNavTabs />

        <div className="flex border-b bg-white items-stretch justify-between">
          <ModelBreadList />
          <ModelBreadAction />
        </div>
        <div className="flex flex-1 items-stretch flex-col">{children}</div>
      </div>
    </ProtectedRoute>
  );
};
