import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const notes = [];

const requiredFiles = [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "package.json",
  "tsconfig.json",
  "dist/server/src/server.js",
  "public/index.html",
  "public/app.js",
  "public/styles.css",
  "docs/images/service-request-dashboard.png",
  "api/openapi.json",
  "api/openapi.yaml",
  "api/postman/service-request-platform.postman_collection.json",
  "data/requests.json",
  "data/knowledge-articles.json",
  "database/mysql/001_schema.sql",
  "database/mysql/002_seed.sql",
  "server/src/server.ts",
  "apps/react-client/src/App.tsx",
  "apps/vue-dashboard/src/App.vue",
  "apps/angularjs-admin/src/app.module.js",
  "services/python-reporting/app/main.py",
  "services/php-webhook/public/index.php",
  "services/laravel-api/routes/api.php",
  "infra/azure/main.bicep",
  ".github/workflows/ci.yml"
];

for (const path of requiredFiles) {
  if (!existsSync(join(root, path))) errors.push(`Required file is missing: ${path}`);
}

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    errors.push(`Invalid JSON in ${path}: ${error.message}`);
    return null;
  }
}

const jsonFiles = [
  "package.json",
  "data/requests.json",
  "data/knowledge-articles.json",
  "api/openapi.json",
  "api/postman/service-request-platform.postman_collection.json",
  "api/postman/local.postman_environment.json",
  "apps/react-client/package.json",
  "apps/vue-dashboard/package.json",
  "apps/angularjs-admin/package.json",
  "services/laravel-api/composer.json"
];
const parsed = new Map(jsonFiles.map((path) => [path, readJson(path)]));

const packageJson = parsed.get("package.json");
for (const script of ["build", "start", "validate", "test", "lint:js", "lint:php", "test:php", "test:python", "qa"]) {
  if (!packageJson?.scripts?.[script]) errors.push(`package.json is missing the ${script} script.`);
}
if (packageJson?.engines?.node !== ">=22") errors.push("package.json must document Node.js 22 or newer.");

const statuses = new Set(["Backlog", "Open", "In Progress", "Waiting", "Resolved", "Closed"]);
const priorities = new Set(["Low", "Medium", "High", "Urgent"]);
const categories = new Set([
  "Account",
  "Attachments",
  "Billing",
  "Data Export",
  "Documentation",
  "Feature Request",
  "Notifications",
  "Usability"
]);

const requests = parsed.get("data/requests.json");
if (!Array.isArray(requests) || requests.length < 8) {
  errors.push("data/requests.json must contain at least eight sample requests.");
} else {
  const ids = new Set();
  for (const [index, request] of requests.entries()) {
    const label = `data/requests.json item ${index + 1}`;
    if (!/^SR-\d{4}$/.test(request.id ?? "")) errors.push(`${label} has an invalid public ID.`);
    if (ids.has(request.id)) errors.push(`${label} duplicates ${request.id}.`);
    ids.add(request.id);
    if (typeof request.title !== "string" || request.title.length < 8 || request.title.length > 120) errors.push(`${label} has an invalid title.`);
    if (typeof request.description !== "string" || request.description.length < 20) errors.push(`${label} has an invalid description.`);
    if (!statuses.has(request.status)) errors.push(`${label} has an unsupported status.`);
    if (!priorities.has(request.priority)) errors.push(`${label} has an unsupported priority.`);
    if (!categories.has(request.category)) errors.push(`${label} has an unsupported category.`);
    if (!request.requester?.email?.endsWith(".test")) errors.push(`${label} must use a fictional .test email address.`);
    if (!Array.isArray(request.tags) || !Array.isArray(request.comments)) errors.push(`${label} must contain tag and comment arrays.`);
    for (const field of ["createdAt", "updatedAt"]) {
      if (Number.isNaN(Date.parse(request[field]))) errors.push(`${label} has an invalid ${field}.`);
    }
  }
  notes.push(`${requests.length} deterministic request fixtures`);
}

const articles = parsed.get("data/knowledge-articles.json");
if (!Array.isArray(articles) || articles.length < 3) errors.push("Knowledge article fixtures are missing or too small.");

const openApi = parsed.get("api/openapi.json");
if (openApi?.openapi !== "3.1.0") errors.push("OpenAPI JSON must use version 3.1.0.");
for (const path of [
  "/api/health",
  "/api/requests",
  "/api/requests/{requestId}",
  "/api/requests/{requestId}/comments",
  "/api/metrics",
  "/api/knowledge-articles",
  "/api/demo/reset"
]) {
  if (!openApi?.paths?.[path]) errors.push(`OpenAPI contract is missing ${path}.`);
}

const screenshot = join(root, "docs/images/service-request-dashboard.png");
if (existsSync(screenshot)) {
  const bytes = readFileSync(screenshot);
  const pngSignature = "89504e470d0a1a0a";
  if (bytes.subarray(0, 8).toString("hex") !== pngSignature) errors.push("Dashboard screenshot is not a valid PNG.");
  if (bytes.length < 20_000) errors.push("Dashboard screenshot appears to be empty or incomplete.");
}

const forbiddenArtifacts = ["node_modules", "__pycache__", ".pytest_cache", ".DS_Store", "Thumbs.db"];
const textExtensions = new Set([".md", ".txt", ".json", ".yaml", ".yml", ".js", ".mjs", ".ts", ".tsx", ".vue", ".py", ".php", ".sql", ".html", ".css", ".scss", ".bicep", ".xml", ".cmd", ".sh"]);
const disallowedText = [
  [new RegExp("source\\s*=\\s*g" + "pt", "iu"), "automated source marker"],
  [new RegExp("\\bchat" + "gpt\\b", "iu"), "chat assistant reference"],
  [/generated by (?:an? )?ai/iu, "AI-generation marker"],
  [new RegExp("\\bopen" + "ai\\b", "iu"), "AI vendor reference"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u, "private key"]
];
const markdownFiles = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const rel = relative(root, path).replaceAll("\\", "/");
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (forbiddenArtifacts.includes(name)) errors.push(`Generated directory must not be committed: ${rel}`);
      if (name === ".git" || name === "vendor" || name === "dist") continue;
      visit(path);
      continue;
    }
    if (name.endsWith(".pyc")) errors.push(`Compiled Python file must not be committed: ${rel}`);
    if (forbiddenArtifacts.includes(name)) errors.push(`Generated file must not be committed: ${rel}`);
    const extension = extname(name).toLowerCase();
    if (!textExtensions.has(extension)) continue;
    const content = readFileSync(path, "utf8");
    for (const [pattern, description] of disallowedText) {
      if (pattern.test(content)) errors.push(`${description} found in ${rel}.`);
    }
    if (/\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{20,}\b/u.test(content)) errors.push(`Possible GitHub credential found in ${rel}.`);
    if (/AccountKey=[A-Za-z0-9+/=]{20,}/u.test(content)) errors.push(`Possible cloud account key found in ${rel}.`);
    if (extension === ".md") markdownFiles.push(path);
  }
}
visit(root);

for (const file of markdownFiles) {
  const content = readFileSync(file, "utf8");
  const links = content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/gu);
  for (const match of links) {
    const target = match[1].trim().split(/\s+"/u)[0].split("#")[0];
    if (!target || /^(?:https?:|mailto:|#)/u.test(target) || target.includes("<")) continue;
    const decoded = decodeURIComponent(target);
    const resolved = resolve(dirname(file), decoded);
    if (!existsSync(resolved)) errors.push(`Broken local Markdown link in ${relative(root, file)}: ${target}`);
  }
}

if (existsSync(join(root, ".env"))) errors.push("A real .env file must not be committed.");

if (errors.length) {
  console.error(`Project validation failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Project validation passed (${requiredFiles.length} required files, ${notes.join(", ")}).`);
