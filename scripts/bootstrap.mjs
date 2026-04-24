import { copyFileSync, existsSync } from "node:fs";

const pairs = [
  [".env.example", ".env"],
  ["apps/api/.env.example", "apps/api/.env"],
  ["apps/web/.env.example", "apps/web/.env"],
  ["apps/workers/.env.example", "apps/workers/.env"]
];

for (const [src, dest] of pairs) {
  if (!existsSync(dest) && existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`created ${dest}`);
  }
}

console.log("bootstrap listo");
