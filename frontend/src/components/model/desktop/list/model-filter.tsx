import { useValtioTab } from "@/hooks/use-valtio-tab";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { ModelToolbar } from "../toolbar";

export const ModelFilter = () => {
  const { state } = useValtioTab();
  const reader = useSnapshot(state);

  useEffect(() => {}, [reader.list.filter]);

  return (
    <ModelToolbar
      left={
        <>
          dqwfq
          {JSON.stringify(reader.list.layout?.filters)}
        </>
      }
    />
  );
};
