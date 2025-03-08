import { startCase, toLower } from "lodash";
import id from "./id";
export const translate = (
  msg: keyof typeof id,
  opt?: { params: Record<string, any>; capitalizedParams?: boolean }
) => {
  let translated = id[msg];

  // Replace all placeholders with their corresponding values
  if (translated && opt?.params) {
    Object.entries(opt?.params).forEach(([key, value]) => {
      const placeholder = `:${key}`;
      translated = translated.replace(
        placeholder,
        opt?.capitalizedParams
          ? startCase(toLower(String(value)))
          : String(value)
      );
    });
  }

  return translated;
};
