import { models } from "shared/generated/models";
import { modelInstance } from "system/model/instance";
import { apiContext, defineAPI } from "system/server/parts/api/define";

export default defineAPI({
  path: "/api/model",
  handler: async function (opt: {
    method: string;
    modelName: string;
    options: any;
  }) {
    const { req } = apiContext(this);

    const model = models[opt.modelName as keyof typeof models];
    if (!model) {
      throw new Error(`Model ${opt.modelName} not found`);
    }

    const instance = modelInstance(model);
    switch (opt.method) {
      case "findFirst":
        return instance.findFirst(opt.options);
      case "findMany":
        return instance.findMany(opt.options);
      case "findList":
        return instance.findList(opt.options);
      case "save":
        return instance.save(opt.options);
      default:
        throw new Error(`Method ${opt.method} not found`);
    }
  },
});
