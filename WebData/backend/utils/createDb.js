const mysql = require("mysql2/promise");
require("dotenv").config();

const DB_NAME = process.env.SQL_DATABASE_NAME;

const createDatabaseIfNotExists = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.SQL_HOST || "localhost",
      user: process.env.SQL_USER,
      password: process.env.SQL_PASS,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`✅ Database "${DB_NAME}" is ready.`);

    await connection.end();
  } catch (error) {
    console.error("❌ Error creating database:", error.message);
    process.exit(1);
  }
};

module.exports = createDatabaseIfNotExists;
