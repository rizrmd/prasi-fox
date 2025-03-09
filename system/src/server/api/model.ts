import { apiContext, defineAPI } from "system/server/parts/api/define";

export default defineAPI({
  path: "/api/model",
  handler: async function (opt: { method: string; options: any }) {
    const { req } = apiContext(this);
    return opt;
  },
});
