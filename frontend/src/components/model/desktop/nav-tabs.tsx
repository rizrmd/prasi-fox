import { DraggableTabs, type Tab } from "@/components/ext/draggable-tabs";
import { useValtioTab } from "@/hooks/use-valtio-tab";
import { navigate, parseRouteParams } from "@/lib/router";
import { cn } from "@/lib/utils";
import { css } from "goober";
import type { FC } from "react";
import { useSnapshot } from "valtio";

export const ModelNavTabs: FC<{}> = ({}) => {
  const { write } = useValtioTab();
  const nav = useSnapshot(write);
  const tabs = Object.values(nav.state.tabs)
    .map((e) => e.ui)
    .sort((a, b) => a.index - b.index);
  const activeIndex = nav.state.active.index;

  return (
    <div className="flex relative items-stretch flex-col overflow-hidden">
      <div
        className={cn(
          "border-b border-sidebar-border transition-all",
          nav.state.show ? "h-[40px]" : "h-0"
        )}
      ></div>
      <DraggableTabs
        activeIndex={activeIndex}
        tabs={tabs as unknown as Tab[]}
        className={cn(
          "bg-transparent pb-0 pt-0 items-end absolute left-0 top-0 right-0 z-10",
          css`
            .tab-item {
              border: 1px solid transparent;
              border-bottom: 0;
              position: absolute;
              cursor: pointer;
            }
            .tab-item[data-state="active"] {
              background: white;
              box-shadow: none !important;
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
              color: var(--ring);
              border: 1px solid var(--sidebar-border);
              border-bottom: 0;
            }
          `
        )}
        onTabChange={(index) => {
          const tab = tabs[index]!;

          write.state.active = { id: tab.id, index };
          navigate(tabs[index]!.url);
        }}
        onTabClose={(tabId) => {
          const tabIndex = tabs.findIndex((e) => e.id === tabId);
          if (tabIndex !== -1) {
            // Update active index if needed
            if (tabs.length === 0) {
              navigate("/");
            } else if (tabIndex <= activeIndex) {
              navigate(nav.state.tabs[nav.state.active.id]!.ui.url);
            }
          }
        }}
        onTabsReorder={(tabs) => {
          // write.tabs = tabs;
          let i = 0;
          for (const tab of tabs) {
            const t = write.state.tabs[tab.id];
            if (t) {
              t.ui.index = i;
            }
            i++;
          }
        }}
      />
    </div>
  );
};

export const openInNewTab = async (
  url: string,
  opt?: { activate?: boolean }
) => {
  const params = parseRouteParams(url);

  if (params) {
    // const newTab = {
    //   id: cuid(),
    //   url,
    //   label: modelName,
    //   closable: true,
    // };
    // // Check if tab with this URL already exists
    // const existingTabIndex = findTabIndexByUrl(url);
    // if (existingTabIndex !== -1) {
    //   if (opt?.activate !== false) {
    //     nav.activeIdx = existingTabIndex;
    //     navigate(url);
    //   }
    // } else {
    //   nav.tabs.push(newTab);
    //   if (opt?.activate !== false) {
    //     nav.activeIdx = nav.tabs.length - 1;
    //     navigate(url);
    //   }
    // }
    // saveNavState();
    // nav.render();
  }
};
