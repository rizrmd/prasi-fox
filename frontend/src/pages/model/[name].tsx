import { AppLoading } from "@/components/app/app-loading";
import { ModelContainer } from "@/components/model/desktop/container";
import { ModelFilter } from "@/components/model/desktop/list/model-filter";
import { ModelList } from "@/components/model/desktop/list/model-list";
import { useValtioTab } from "@/hooks/use-valtio-tab";
import { useSnapshot } from "valtio";

export default () => {
  const tab = useValtioTab({ root: true });
  const reader = useSnapshot(tab.state);


  if (!reader.list.ready) {
    tab.action.list.init(tab);
  }

  return (
    <ModelContainer>
      {reader.list.loading ? (
        <>
          <AppLoading />
        </>
      ) : (
        <>
          <ModelFilter />
          <ModelList />
        </>
      )}
    </ModelContainer>
  );
};
