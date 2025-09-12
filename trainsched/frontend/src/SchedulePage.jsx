import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./assets/css/App.scss";

export default function SchedulePage({ token }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [programInput, setProgramInput] = useState("");

  // Fetch schedule from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/schedule", { headers: { Authorization: token } })
      .then((res) => {
        const data = {};
        days.forEach((day) => {
          data[day] = res.data[day] || { tasks: [], start_time: "", end_time: "" };
        });
        setSchedule(data);
      })
      .catch((err) => console.error(err));
  }, [token]);

  const toggleDay = (day) => {
    setSelectedDay(day);
    if (!schedule[day]) {
      setSchedule({ ...schedule, [day]: { tasks: [], start_time: "", end_time: "" } });
    }
  };

  const updateTime = (day, time, type) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [type]: time },
    });
  };

  const addTask = (day) => {
    if (!programInput.trim()) return;
    const newTask = { title: programInput, description: "" };
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], tasks: [...schedule[day].tasks, newTask] },
    });
    setProgramInput("");
  };

  const removeTask = (day, index) => {
    const updated = [...schedule[day].tasks];
    updated.splice(index, 1);
    setSchedule({ ...schedule, [day]: { ...schedule[day], tasks: updated } });
  };

  const saveSchedule = async () => {
    try {
      await axios.post(
        "http://localhost:5000/schedule",
        { schedule },
        { headers: { Authorization: token } }
      );
      alert("Schedule saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save schedule");
    }
  };

  return (
    <div className="schedule">
      <h1 className="schedule__title">📅 My Training Schedule</h1>

      <div className="schedule__grid">
        {days.map((day) => (
          <motion.div
            key={day}
            className={`schedule__day ${selectedDay === day ? "schedule__day--active" : ""}`}
            whileHover={{ scale: 1.05 }}
            onClick={() => toggleDay(day)}
          >
            <h2 className="schedule__day-name">{day}</h2>
            {schedule[day] && (
              <>
                <div>
                  <label>Start:</label>
                  <input
                    type="time"
                    value={schedule[day].start_time || ""}
                    onChange={(e) => updateTime(day, e.target.value, "start_time")}
                  />
                  <label>End:</label>
                  <input
                    type="time"
                    value={schedule[day].end_time || ""}
                    onChange={(e) => updateTime(day, e.target.value, "end_time")}
                  />
                </div>
                <ul className="schedule__task-list">
                  {schedule[day].tasks.map((task, i) => (
                    <li key={i}>
                      {task.title}{" "}
                      <button onClick={() => removeTask(day, i)}>❌</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {selectedDay && (
        <motion.div
          className="schedule__editor"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Edit {selectedDay} Training</h2>
          <input
            type="text"
            placeholder="New training task"
            value={programInput}
            onChange={(e) => setProgramInput(e.target.value)}
          />
          <button onClick={() => addTask(selectedDay)}>➕ Add Task</button>
        </motion.div>
      )}

      <button onClick={saveSchedule} style={{ marginTop: "20px", padding: "10px 20px" }}>
        💾 Save Schedule
      </button>
    </div>
  );
}
