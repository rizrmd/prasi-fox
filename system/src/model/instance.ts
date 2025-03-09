import type { ModelBase } from "./base";
import { findFirst } from "./query/find-first";
import { findMany } from "./query/find-many";
import { findList } from "./query/find-list";
import { save, type SaveOptions } from "./query/save";
import type {
  FieldItem,
  WhereClause,
  OrderByClause,
  FindListResult,
  FindFirstOptions,
  FindManyOptions,
  FindListOptions,
} from "./query/utils/types";

type PartialFindFirstOptions = Partial<Omit<FindFirstOptions, "model">>;
type PartialFindManyOptions = Partial<Omit<FindManyOptions, "model">>;
type PartialFindListOptions = Partial<Omit<FindListOptions, "model">>;
type SaveDebugFunction = (params: { arg: any; sql: string }) => void;

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

export const modelInstance = <T extends ModelBase>(base: T) => {
  const primaryKeys: string[] = Object.entries(base.columns)
    .filter(([k, column]) => column.primary)
    .map(([k, column]) => k);
  return {
    base,
    primaryKey: primaryKeys[0],
    primaryKeys,
    async findFirst(options: PartialFindFirstOptions = {}) {
      const { where = [], fields = ["*"], includeDeleted, debug } = options;
      return findFirst({
        where,
        fields,
        model: base,
        includeDeleted,
        debug,
      });
    },
    async findMany(options: PartialFindManyOptions = {}) {
      const {
        where = [],
        fields = ["*"],
        limit,
        offset,
        orderBy,
        includeDeleted,
        debug,
      } = options;
      return findMany({
        where,
        fields,
        model: base,
        limit,
        offset,
        orderBy,
        includeDeleted,
        debug,
      });
    },
    async findList(options: PartialFindListOptions = {}) {
      const {
        where = [],
        fields = ["*"],
        currentPage,
        itemPerPage,
        orderBy,
        includeDeleted,
        debug,
      } = options;
      return findList({
        where,
        fields,
        model: base,
        currentPage,
        itemPerPage,
        orderBy,
        includeDeleted,
        debug,
      });
    },
    async save(opt: SaveOptions) {
      return save({
        ...opt,
        model: base,
      });
    },
  };
};
