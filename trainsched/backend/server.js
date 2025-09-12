import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Init DB from schema.sql (optional)
async function initDB() {
  const sql = fs.readFileSync("./schema.sql", "utf8");
  await pool.query(sql);
}
initDB();

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
}

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      "INSERT INTO trainsched.users (username, password) VALUES ($1, $2)",
      [username, hashed]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query(
    "SELECT * FROM trainsched.users WHERE username=$1",
    [username]
  );
  if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });

});

// Get schedule
app.get("/schedule", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const result = await pool.query(
    `SELECT s.id AS schedule_id, s.name AS schedule_name,
            sd.id AS day_id, sd.day_of_week, sd.start_time, sd.end_time,
            t.id AS task_id, t.title, t.description, t.position
       FROM trainsched.schedules s
       LEFT JOIN trainsched.schedule_days sd ON sd.schedule_id = s.id
       LEFT JOIN trainsched.tasks t ON t.day_id = sd.id
      WHERE s.user_id = $1
      ORDER BY sd.id, t.position`,
    [userId]
  );

  // Transform to nested structure for frontend
  const schedule = {};
  result.rows.forEach((row) => {
    if (!schedule[row.day_of_week]) {
      schedule[row.day_of_week] = {
        day_id: row.day_id,
        start_time: row.start_time,
        end_time: row.end_time,
        tasks: [],
      };
    }
    if (row.task_id) {
      schedule[row.day_of_week].tasks.push({
        task_id: row.task_id,
        title: row.title,
        description: row.description,
        position: row.position,
      });
    }
  });

  res.json(schedule);
});

// Save schedule
app.post("/schedule", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const scheduleData = req.body.schedule;

  try {
    // Check if user has schedule
    const scheduleResult = await pool.query(
      "SELECT id FROM trainsched.schedules WHERE user_id=$1",
      [userId]
    );
    let scheduleId;
    if (scheduleResult.rows.length === 0) {
      const insert = await pool.query(
        "INSERT INTO trainsched.schedules (user_id, name) VALUES ($1, $2) RETURNING id",
        [userId, "Weekly Schedule"]
      );
      scheduleId = insert.rows[0].id;
    } else {
      scheduleId = scheduleResult.rows[0].id;
    }

    // Clear tasks
    await pool.query(
      `DELETE FROM trainsched.tasks WHERE day_id IN 
       (SELECT id FROM trainsched.schedule_days WHERE schedule_id=$1)`,
      [scheduleId]
    );
    await pool.query(
      "DELETE FROM trainsched.schedule_days WHERE schedule_id=$1",
      [scheduleId]
    );

    // Save new tasks to DB
    for (const [dayName, dayData] of Object.entries(scheduleData)) {
      const dayInsert = await pool.query(
        "INSERT INTO trainsched.schedule_days (schedule_id, day_of_week, start_time, end_time) VALUES ($1,$2,$3,$4) RETURNING id",
        [scheduleId, dayName, dayData.start_time || null, dayData.end_time || null]
      );
      const dayId = dayInsert.rows[0].id;

      for (let i = 0; i < dayData.tasks.length; i++) {
        const task = dayData.tasks[i];
        await pool.query(
          "INSERT INTO trainsched.tasks (day_id, title, description, position) VALUES ($1,$2,$3,$4)",
          [dayId, task.title, task.description || null, i]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

app.listen(port, () => console.log(`Server running`));
