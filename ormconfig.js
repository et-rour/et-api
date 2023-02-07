// const config = require("./src/config/config");

// module.exports = {
//   type: config.db_settings.type,
//   host: config.db_settings.host,
//   port: config.db_settings.port,
//   username: config.db_settings.username,
//   password: config.db_settings.password,
//   database: config.db_settings.database,
//   synchronize: false,
//   logging: true,
//   entities: ["src/models/**/*.ts"],
//   migrations: ["src/migrations/**/*.ts"],
//   cli: {
//     migrationsDir: "src/migrations",
//   },
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
//   // "subscribers": [
//   //    "src/subscriber/**/*.ts"
//   // ]
// };


const config = require("./src/config/config");

module.exports = {
  type: config.db_settings.type,
  host: config.db_settings.host,
  port: config.db_settings.port,
  username: config.db_settings.username,
  password: config.db_settings.password,
  database: config.db_settings.database,
  synchronize: false,
  logging: true,
  entities: ["src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  cli: {
    migrationsDir: "src/migrations",
  },
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};