import { readFile } from "fs/promises";
import { parse } from "yaml";
import { join } from "path";
import { models } from "shared/generated/models";
import { modelInstance, type ModelInstance } from "system/model/instance";
import type { ModelBase } from "system/model/base";

// Define types for auth.yaml structure
export interface AuthYamlConfig {
  enabled: boolean;
  mapping: {
    user: {
      table: string;
      fields: {
        id: string;
        fullname: string;
        username: string;
        password: string;
        role_id: string;
      };
      default: {
        role_id: string;
      };
    };
    role: {
      table: string;
      fields: {
        id: string;
        name: string;
      };
    };
    session: {
      table: string;
      fields: {
        id: string;
        status: string;
        user_id: string;
      };
    };
  };
  features: {
    login: boolean;
    logout: boolean;
    register: boolean;
    reset_password: boolean;
  };
}

export const authBackend = {
  status: "init" as "init" | "loaded",
  config: null as unknown as AuthYamlConfig,

  modelName: { user: "", session: "", role: " " },
  model: {
    user: null as unknown as ModelInstance<ModelBase>,
    session: null as unknown as ModelInstance<ModelBase>,
    role: null as unknown as ModelInstance<ModelBase>,
  },

  async init() {
    try {
      // Path to auth.yaml relative to the project root
      const configPath = join(process.cwd(), "shared", "config", "auth.yaml");

      // Read and parse the YAML file
      const yamlContent = await readFile(configPath, "utf-8");
      this.config = parse(yamlContent) as AuthYamlConfig;
      this.status = "loaded";

      for (const [key, value] of Object.entries(models)) {
        for (const [k, v] of Object.entries(this.config?.mapping || {})) {
          if (v.table === value.table) {
            (this.modelName as any)[k] = key;
            (this.model as any)[k] = modelInstance(value);
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to load auth configuration:", error);
      return false;
    }
  },
};
