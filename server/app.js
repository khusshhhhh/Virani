const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// PostgreSQL Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Render's DATABASE_URL environment variable
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
});

// Middleware
app.use(
  cors({
    origin: ["https://paramountlandscaping.au", "http://localhost:5500"], // Allow frontend requests
    credentials: true, // Allow cookies
  })
);
app.use(bodyParser.json());

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// ------------------ Authentication Endpoints ------------------

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admin WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ message: "Login successful", redirect: "dashboard.html" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Middleware to Check Authentication
function isAuthenticated(req, res, next) {
  next(); // Allow all requests without checking
}

// ------------------ Jobs Endpoints ------------------

// Add Job
app.post("/jobs", isAuthenticated, async (req, res) => {
  const {
    category,
    address,
    size,
    created_date,
    deadline,
    status,
    contractor,
    contractor_quote,
    job_quote,
    expenses,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO jobs (category, address, size, created_date, deadline, status, contractor, contractor_quote, job_quote, expenses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        category,
        address,
        size,
        created_date,
        deadline,
        status,
        contractor,
        contractor_quote,
        job_quote,
        expenses,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ error: "Failed to add job" });
  }
});

// Fetch All Jobs
app.get("/jobs", async (req, res) => {
  const { status } = req.query;

  try {
    const query = status
      ? "SELECT * FROM jobs WHERE status = $1"
      : "SELECT * FROM jobs";
    const params = status ? [status] : [];
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Delete Job
app.delete("/jobs/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM jobs WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// Update Job
app.put("/jobs/:id", async (req, res) => {
  const { id } = req.params;
  const {
    address,
    deadline,
    status,
    contractor,
    contractor_quote,
    job_quote,
    expenses,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE jobs
           SET address = $1, deadline = $2, status = $3, contractor = $4,
               contractor_quote = $5, job_quote = $6, expenses = $7
           WHERE id = $8 RETURNING *`,
      [
        address,
        deadline,
        status,
        contractor,
        contractor_quote,
        job_quote,
        expenses,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// ------------------ Contractors Endpoints ------------------

// Add Contractor
app.post("/contractors", isAuthenticated, async (req, res) => {
  const { name, category, mobile } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO contractors (name, category, mobile) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, category, mobile]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding contractor:", error);
    res.status(500).json({ error: "Failed to add contractor" });
  }
});

// Fetch All Contractors
app.get("/contractors", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contractors");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({ error: "Failed to fetch contractors" });
  }
});

// Delete Contractor
app.delete("/contractors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM contractors WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    res.json({
      message: "Contractor deleted successfully",
      contractor: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting contractor:", error);
    res.status(500).json({ error: "Failed to delete contractor" });
  }
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
