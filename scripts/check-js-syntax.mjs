import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const roots = ["public", "apps/angularjs-admin", "apps/fundamentals", "scripts", "tests/node"];
const ignored = new Set(["node_modules", "dist", "vendor"]);
const files = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    if (ignored.has(name)) continue;
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) visit(path);
    else if (extname(path) === ".js" || extname(path) === ".mjs") files.push(path);
  }
}

for (const item of roots) {
  const path = join(root, item);
  if (statSync(path).isDirectory()) visit(path);
  else files.push(path);
}

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

console.log(`JavaScript syntax passed for ${files.length} files.`);
