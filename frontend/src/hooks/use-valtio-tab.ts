import type { Tab } from "@/components/ext/draggable-tabs";
import { proxy, ref } from "valtio";
import { useParams } from "./use-router";
import { models } from "shared/generated/models";
import { modelClient, type ModelClient } from "system/model/client";
const defaultTab = {
  ui: {
    index: 0,
    id: "",
    label: "",
    url: "",
  } as Tab,
  nav: {
    modelName: "",
    id: null as null | string,
    hash: {} as Record<string, string>,
  },
  list: {
    ready: false,
    loading: false,
    filter: {},
    layout: {
      filters: [],
    },
  },
  model: null as (typeof models)[keyof typeof models] | null,
  instance: null as ModelClient | null,
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
  const { params, hash } = useParams();
  const { state, action } = internal;

  const tabs = state.tabs;
  if (!tabs[state.active.id]) {
    tabs[state.active.id] = proxy(defaultTab);

    const tab = tabs[state.active.id];
    if (tab) {
      if (params.name) {
        tab.nav.modelName = params.name;
      }
      if (params.id) {
        tab.nav.id = params.id;
      }
      tab.nav.hash = hash;

      const model = models[params.name as keyof typeof models];
      if (model) {
        tab.model = ref(model);
        tab.instance = ref(modelClient(model, params.name as string));
        tab.instance.findFirst().then((res) => {
          console.log(res);
        });
      } else {
        console.warn(`Model ${params.name} not found`);
      }
    }
  }

  return { state: tabs[state.active.id]!, action, write: internal };
};
