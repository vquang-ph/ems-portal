import { Logger } from "@nestjs/common";
import dataSource from "./datasource";
import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm";

const logger = new Logger("SeedRunner");

/**
 * Interface representing a seed module's structure.
 * Each seed file must export a 'run' function with this signature.
 */
interface SeedModule {
  run: (dataSource: DataSource, logger: Logger) => Promise<void>;
}

async function runSeeds(): Promise<void> {
  const seedsDir = path.join(__dirname, "seeds");

  if (!fs.existsSync(seedsDir)) {
    logger.warn(`Seeds directory not found at ${seedsDir}`);
    return;
  }

  // Find all *.seed.ts
  const seedFiles = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith(".seed.ts"))
    .sort(); // sort the script, 01 should be run before 02, etc.

  if (seedFiles.length === 0) {
    logger.log("No seed files found.");
    return;
  }

  logger.log(`Found ${seedFiles.length} seed files: ${seedFiles.join(", ")}`);

  for (const file of seedFiles) {
    const filePath = path.join(seedsDir, file);
    logger.log(`Running seed: ${file}...`);

    try {
      // Cast the dynamic import for type safety
      const seedModule = (await import(filePath)) as SeedModule;

      const runFn = seedModule.run;

      if (typeof runFn !== "function") {
        logger.error(
          `Seed file ${file} does not export a 'run' function. Skipping.`,
        );
        continue;
      }

      await runFn(dataSource, logger);
      logger.log(`Successfully completed seed: ${file}`);
    } catch (error) {
      logger.error(`Failed to execute seed: ${file}`, error);
      throw error;
    }
  }
}

async function main(): Promise<void> {
  let exitCode = 0;
  try {
    // This script is only expected to be run in sandbox or development environments.
    if (process.env.NODE_ENV === "production") {
      logger.error(
        "DANGER: Seeding is disabled in the production environment!",
      );
      process.exit(1);
    }

    logger.log("Connecting to Database...");
    await dataSource.initialize();

    logger.log("Starting Seeding Process...");
    await runSeeds();

    logger.log("All Seeds Completed Successfully.");
  } catch (error) {
    logger.error("Seeding Process Failed", error);
    exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(exitCode);
  }
}

// Only run main if this script is executed directly (not imported as a module)
if (require.main === module) {
  main().catch((error) => {
    logger.error("Fatal Error in Seed Runner", error);
    process.exit(1);
  });
}
