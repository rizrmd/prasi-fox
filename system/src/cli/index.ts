import { modelPull } from "./model-pull";
import { modelPush } from "./model-push";
import { modelGenerate } from "./model-generate";

const command = process.argv[2];

if (command === "push") {
  modelPush()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else if (command === "pull") {
  modelPull()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else if (command === "generate") {
  modelGenerate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  console.error("Available commands: bun run model push|pull|generate");
  process.exit(1);
}
