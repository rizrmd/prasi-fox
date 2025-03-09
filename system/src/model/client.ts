import { api } from "frontend/src/lib/generated/api";
import type { ModelBase } from "./base";
import { type SaveOptions } from "./query/save";
import type {
  FindFirstOptions,
  FindListOptions,
  FindListResult,
  FindManyOptions,
} from "./query/utils/types";

type PartialFindFirstOptions = Partial<Omit<FindFirstOptions, "model">>;
type PartialFindManyOptions = Partial<Omit<FindManyOptions, "model">>;
type PartialFindListOptions = Partial<Omit<FindListOptions, "model">>;

export type ModelInstance<T extends ModelBase> = {
  base: T;
  primaryKey: string;
  primaryKeys: string[];
  findFirst: (
    options?: PartialFindFirstOptions
  ) => Promise<Record<string, any> | null>;
  findMany: (
    options?: PartialFindManyOptions
  ) => Promise<Record<string, any>[]>;
  findList: (options?: PartialFindListOptions) => Promise<FindListResult>;
  save: (options: Omit<SaveOptions, "model">) => Promise<Record<string, any>>;
};

export type ModelClient = ReturnType<typeof modelClient>;
export const modelClient = <T extends ModelBase>(
  model: T,
  modelName: string
) => {
  const primaryKeys: string[] = Object.entries(model.columns)
    .filter(([k, column]) => column.primary)
    .map(([k, column]) => k);

  return {
    model,
    primaryKey: primaryKeys[0],
    primaryKeys,
    async findFirst(options: PartialFindFirstOptions = {}) {
      return api.model({ method: "findFirst", modelName, options });
    },
    async findMany(options: PartialFindManyOptions = {}) {
      return api.model({ method: "findFirst", modelName, options });
    },
    async findList(options: PartialFindListOptions = {}) {
      return api.model({ method: "findList", modelName, options });
    },
    async save(options: SaveOptions) {
      return api.model({ method: "save", modelName, options });
    },
  };
};
