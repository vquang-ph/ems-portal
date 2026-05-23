import { DataSource } from "typeorm";
import { config } from "dotenv";
import { buildDataSourceOptions } from "@/config/database.builder";
import path from "path";

// .env is located at the root of the monorepo
config({ path: path.resolve(__dirname, "../../../../.env") });

const options = buildDataSourceOptions(process.env);

export default new DataSource(options);
