const bcrypt = require("bcrypt");
const { Pool } = require("pg");

// PostgreSQL Configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "job_management",
  password: "khush3160", // Replace with your PostgreSQL password
  port: 5432,
});

const username = "admin"; // Replace with desired username
const plainPassword = "admin3160"; // Replace with desired password

// Hash password and insert admin user
async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash the password with a salt factor of 10

    const result = await pool.query(
      `INSERT INTO admin (username, password) VALUES ($1, $2) RETURNING *`,
      [username, hashedPassword]
    );

    console.log("Admin user created successfully:", result.rows[0]);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    pool.end(); // Close the database connection
  }
}

createAdminUser();
