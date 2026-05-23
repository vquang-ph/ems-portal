import * as fs from "fs";
import * as path from "path";

// Helper to get __dirname in ESM if needed, though we can use process.cwd() for a root script
const ROOT_DIR = process.cwd();

// Join all arguments to support multi-word names even without quotes (e.g., "new test" -> "new test")
const rawModuleName = process.argv.slice(2).join(" ");

if (!rawModuleName) {
  console.error("Error: Please provide a module name.");
  console.log(
    'Usage: yarn scaffold:backend "hello world" OR yarn scaffold:backend hello world',
  );
  process.exit(1);
}

/**
 * Format Names
 * We support whitespace because module names are often descriptive (e.g., "user profile" -> folder "user-profile", class "UserProfile")
 */
const folderName = rawModuleName.trim().toLowerCase().replace(/\s+/g, "-");
const pascalName = rawModuleName
  .trim()
  .split(/[\s-]+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join("");

const moduleRoot = path.join(
  ROOT_DIR,
  "packages/backend/src/modules",
  folderName,
);

const integrationTestRoot = path.join(
  ROOT_DIR,
  "packages/backend/test/integration",
  folderName,
);

/**
 * Check if module already exists
 */
if (fs.existsSync(moduleRoot)) {
  console.error(
    `Error: Module "${folderName}" already exists at ${moduleRoot}`,
  );
  process.exit(1);
}

const directories = ["dto", "entites"];

console.log(`Generating backend module: ${folderName}...`);

/**
 * Create directories and .gitkeep files
 */
directories.forEach((dir) => {
  const dirPath = path.join(moduleRoot, dir);
  fs.mkdirSync(dirPath, { recursive: true });

  // For entity, we already have a file, so we skip .gitkeep
  if (dir !== "entites") {
    fs.writeFileSync(path.join(dirPath, ".gitkeep"), "");
  }
});

console.log(`Created module structure for "${folderName}" at ${moduleRoot}`);

/**
 * Create Entity
 */
const entityContent = `import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("${folderName}")
export class ${pascalName}Entity extends BaseEntity {
  @Column()
  public name: string;
}
`;
fs.writeFileSync(
  path.join(moduleRoot, "entites", `${folderName}.entity.ts`),
  entityContent,
);

/**
 * Create Repository
 */
const repositoryContent = `import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ${pascalName}Entity } from "./entites/${folderName}.entity";

@Injectable()
export class ${pascalName}Repository extends Repository<${pascalName}Entity> {
  public constructor(private readonly dataSource: DataSource) {
    super(${pascalName}Entity, dataSource.createEntityManager());
  }
}
`;
fs.writeFileSync(
  path.join(moduleRoot, `${folderName}.repository.ts`),
  repositoryContent,
);

/**
 * Create Service
 */
const serviceContent = `import { Inject, Injectable } from "@nestjs/common";
import { ${pascalName}Repository } from "./${folderName}.repository";

@Injectable()
export class ${pascalName}Service {
  public constructor(@Inject() private readonly repository: ${pascalName}Repository) {}

  public async getHello(): Promise<{ message: string }> {
    return Promise.resolve({ message: "Hello from ${pascalName} module" });
  }
}
`;
fs.writeFileSync(
  path.join(moduleRoot, `${folderName}.service.ts`),
  serviceContent,
);

/**
 * Create Controller
 */
const controllerContent = `import { Controller, Get } from "@nestjs/common";
import { ${pascalName}Service } from "./${folderName}.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("${pascalName}")
@Controller("${folderName}")
export class ${pascalName}Controller {
  public constructor(private readonly service: ${pascalName}Service) {}

  @Get()
  @ApiOperation({ summary: "Hello from ${pascalName}" })
  public async getHello(): Promise<{ message: string }> {
    return this.service.getHello();
  }
}
`;
fs.writeFileSync(
  path.join(moduleRoot, `${folderName}.controller.ts`),
  controllerContent,
);

/**
 * Create Module
 */
const moduleContent = `import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ${pascalName}Controller } from "./${folderName}.controller";
import { ${pascalName}Service } from "./${folderName}.service";
import { ${pascalName}Entity } from "./entites/${folderName}.entity";
import { ${pascalName}Repository } from "./${folderName}.repository";

@Module({
  imports: [TypeOrmModule.forFeature([${pascalName}Entity])],
  controllers: [${pascalName}Controller],
  providers: [${pascalName}Service, ${pascalName}Repository],
})
export class ${pascalName}Module {}
`;
fs.writeFileSync(
  path.join(moduleRoot, `${folderName}.module.ts`),
  moduleContent,
);
console.log(
  `Created "Entity", "Repository", "Service", "Controller", and "Module" for ${pascalName}...`,
);

/**
 * Create Integration Test directory
 */
fs.mkdirSync(integrationTestRoot, { recursive: true });
fs.writeFileSync(path.join(integrationTestRoot, ".gitkeep"), "");
console.log(`Created integration test directory at ${integrationTestRoot}`);

/**
 * Automatically Register the ${pascalName}Module in AppModule
 */
const appModulePath = path.join(ROOT_DIR, "packages/backend/src/app.module.ts");
if (fs.existsSync(appModulePath)) {
  let appModuleContent = fs.readFileSync(appModulePath, "utf-8");

  // Add Import statement
  const importLine = `import { ${pascalName}Module } from "./modules/${folderName}/${folderName}.module";`;
  if (!appModuleContent.includes(importLine)) {
    const lines = appModuleContent.split("\n");
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("import ")) {
        lastImportIndex = i;
      }
    }
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importLine);
      appModuleContent = lines.join("\n");
    } else {
      appModuleContent = importLine + "\n" + appModuleContent;
    }
  }

  // Add to imports array decorator
  const decoratorStart = appModuleContent.indexOf("@Module");
  if (decoratorStart !== -1) {
    // ONLY search inside the @Module block so we don't accidentally match the import statement
    const decoratorContent = appModuleContent.slice(decoratorStart);

    if (!decoratorContent.includes(`${pascalName}Module`)) {
      // Use regex to find "imports: [" safely regardless of spacing/formatting
      const importsRegex = /imports\s*:\s*\[/;
      const match = appModuleContent.slice(decoratorStart).match(importsRegex);

      if (match && match.index !== undefined) {
        const arrayStartIndex =
          decoratorStart + match.index + match[0].length - 1; // Index of '['

        // Find the matching closing bracket for this specific array
        let bracketCount = 1;
        let currentIndex = arrayStartIndex + 1;
        while (bracketCount > 0 && currentIndex < appModuleContent.length) {
          if (appModuleContent[currentIndex] === "[") bracketCount++;
          if (appModuleContent[currentIndex] === "]") bracketCount--;
          currentIndex++;
        }

        if (bracketCount === 0) {
          const arrayEndIndex = currentIndex - 1; // Index of the closing ']'

          // Find the last non-whitespace character before the closing bracket
          let lastCharIdx = arrayEndIndex - 1;
          while (
            lastCharIdx > arrayStartIndex &&
            /\s/.test(appModuleContent[lastCharIdx])
          ) {
            lastCharIdx--;
          }
          const lastChar = appModuleContent[lastCharIdx];

          let moduleInsertion = `\n    ${pascalName}Module,\n  `;

          // If the array isn't empty and the last element doesn't have a trailing comma, prepend one
          if (lastChar !== "[" && lastChar !== ",") {
            moduleInsertion = `,\n    ${pascalName}Module,\n  `;
          }

          // Splice the string to insert the new module exactly after the last character
          appModuleContent =
            appModuleContent.slice(0, lastCharIdx + 1) +
            moduleInsertion +
            appModuleContent.slice(arrayEndIndex);
        }
      }
    }
  }

  fs.writeFileSync(appModulePath, appModuleContent);
  console.log(`Registered ${pascalName}Module in AppModule`);
}

console.log(`Successfully created backend module "${folderName}"`);
console.log(`Location: ${moduleRoot}`);
