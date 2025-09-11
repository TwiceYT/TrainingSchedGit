CREATE SCHEMA IF NOT EXISTS trainsched AUTHORIZATION postgres;

-- Users table
CREATE TABLE IF NOT EXISTS trainsched.users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedules table
CREATE TABLE IF NOT EXISTS trainsched.schedules (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES trainsched.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Days in a schedule
CREATE TABLE IF NOT EXISTS trainsched.schedule_days (
    id SERIAL PRIMARY KEY,
    schedule_id INT NOT NULL REFERENCES trainsched.schedules(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    start_time TIME,
    end_time TIME
);

-- Tasks/exercises for a day
CREATE TABLE IF NOT EXISTS trainsched.tasks (
    id SERIAL PRIMARY KEY,
    day_id INT NOT NULL REFERENCES trainsched.schedule_days(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS tasks_day_position_idx 
ON trainsched.tasks(day_id, position);
