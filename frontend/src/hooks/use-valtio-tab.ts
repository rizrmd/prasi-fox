import type { Tab } from "@/components/ext/draggable-tabs";
import { proxy, ref } from "valtio";

const defaultTab = {
  ui: {
    index: 0,
    id: "",
    label: "",
    url: "",
  } as Tab,
  nav: {
    modelName: "",
  },
  list: {
    ready: false,
    loading: false,
    filter: {},
    layout: {
      filters: [],
    },
  },
};

const internal = proxy({
  state: {
    status: "initial" as "initial" | "loading" | "ready",
    active: { id: "", index: 0 },
    show: false,
    tabs: {} as Record<string, typeof defaultTab>,
  },
  action: ref({
    list: {
      init: (tab: any) => {
        tab.state.list.ready = true;
      },
    },
  }),
});

export const useValtioTab = (opt?: { root: true }) => {
  const { state: tab, action } = internal;

  const tabs = tab.tabs;
  if (!tabs[tab.active.id]) {
    tabs[tab.active.id] = proxy(defaultTab);
  }

  return { state: tabs[tab.active.id]!, action, write: internal };
};
