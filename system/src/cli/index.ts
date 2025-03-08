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
  console.log(`\
Available commands:

  bun model push           Push model definitions to the database
      --skip-relations     Skip creating foreign key constraints
      --dry-run            Dry run the command
  
  bun model pull           Pull model definitions from the database
      --dry-run            Dry run the command

  bun model generate       Generate TypeScript types from model definitions
  `);
  process.exit(0);
}
