import { proxy, ref, useSnapshot } from "valtio";

const tabs = proxy({
  state: {
    current: 0,
    tabs: [
      {
        nav: {
          modelName: "",
        },
        list: {
          filter: {},
          layout: {
            filters: []
          }
        },
      },
    ],
  },
  action: ref({}),
});

export const useValtioTab = () => {
  const { state: tab, action } = tabs;
  return { state: tab.tabs[tab.current]! };
};
