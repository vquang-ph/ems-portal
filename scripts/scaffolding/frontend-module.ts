import * as fs from "fs";
import * as path from "path";

// Helper to get __dirname in ESM if needed, though we can use process.cwd() for a root script
const ROOT_DIR = process.cwd();

// Join all arguments to support multi-word names even without quotes (e.g., "new test" -> "new test")
const rawModuleName = process.argv.slice(2).join(" ");

if (!rawModuleName) {
  console.error("Error: Please provide a module name.");
  console.log(
    'Usage: yarn scaffold:frontend "hello world" OR yarn scaffold:frontend hello world',
  );
  process.exit(1);
}

/**
 * Format Names
 * We support whitespace because module names are often descriptive (e.g., "user profile" -> folder "user-profile", component "UserProfile")
 */
// "new test" -> "new-test"
const folderName = rawModuleName.trim().toLowerCase().replace(/\s+/g, "-");

// "new test" -> "NewTest"
const pascalName = rawModuleName
  .trim()
  .split(/[\s-]+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join("");

const componentName = `${pascalName}Page`;
const moduleRoot = path.join(
  ROOT_DIR,
  "packages/frontend/src/modules",
  folderName,
);

if (fs.existsSync(moduleRoot)) {
  console.error(
    `Error: Module "${folderName}" already exists at ${moduleRoot}`,
  );
  process.exit(1);
}

const directories = [
  "api",
  "cache",
  "components",
  "hooks",
  "hooks/mutations",
  "hooks/queries",
  "pages",
  "store",
  "test",
  "utils",
];

console.log(`Generating module: ${folderName}...`);

/**
 * Create directories and .gitkeep files (skipping .gitkeep for pages)
 */
directories.forEach((dir) => {
  const dirPath = path.join(moduleRoot, dir);
  fs.mkdirSync(dirPath, { recursive: true });
  if (dir !== "pages") {
    fs.writeFileSync(path.join(dirPath, ".gitkeep"), "");
  }
});

/**
 * Create the Page component
 */
const componentContent = `import React from "react";

const ${componentName}: React.FC = () => {
  return <div>${rawModuleName} module page</div>;
};

export default ${componentName};
`;

fs.writeFileSync(
  path.join(moduleRoot, "pages", `${componentName}.tsx`),
  componentContent,
);

/**
 * Create the index.ts file to export the page component
 */
const indexContent = `export { default as ${componentName} } from "./pages/${componentName}";\n`;
fs.writeFileSync(path.join(moduleRoot, "index.ts"), indexContent);

/**
 * Create the Route file in src/routes
 */
const routeFilePath = path.join(
  ROOT_DIR,
  "packages/frontend/src/routes",
  `${folderName}.tsx`,
);

const routeContent = `import { ${componentName} } from "@/modules/${folderName}";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/${folderName}")({
  component: RouteComponent,
});

function RouteComponent() {
  return <${componentName} />;
}
`;

if (!fs.existsSync(routeFilePath)) {
  fs.writeFileSync(routeFilePath, routeContent);
  console.log(`Route created: ${routeFilePath}`);
} else {
  console.warn(`Route file already exists: ${routeFilePath}`);
}

console.log(`Successfully created module "${folderName}"`);
console.log(`Location: ${moduleRoot}`);
console.log(`Component: ${componentName}`);
