import { Root } from "@/components/app/root";
import { createRoot } from "react-dom/client";
import config from "root/frontend.json";

const w = window as any;
w.config = config;

const elem = document.getElementById("root")!;
const app = <Root />;

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
