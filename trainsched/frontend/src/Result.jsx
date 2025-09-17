import React, { useState, useEffect } from "react";
import Header from "./header";
import "./assets/css/results.scss";

function Dashboard() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/results");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Past Results</h2>
      {results.length === 0 ? (
        <p className="dashboard__empty">No results logged yet.</p>
      ) : (
        results.map((res) => (
          <div key={res._id} className="dashboard__card">
            <h3 className="dashboard__competition">
              {res.competition} ({new Date(res.date).toLocaleDateString()})
            </h3>
            <ul className="dashboard__events">
              {res.events.map((ev, i) => (
                <li key={i} className="dashboard__event">
                  {ev.name}: {ev.performance}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

function LogResult() {
  const [formData, setFormData] = useState({
    competition: "",
    events: [{ name: "", performance: "" }],
    date: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventChange = (index, field, value) => {
    const newEvents = [...formData.events];
    newEvents[index][field] = value;
    setFormData({ ...formData, events: newEvents });
  };

  const addEvent = () => {
    setFormData({ ...formData, events: [...formData.events, { name: "", performance: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert("Result logged!");
      setFormData({ competition: "", events: [{ name: "", performance: "" }], date: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to save result.");
    }
  };

  return (
    <form className="log-result" onSubmit={handleSubmit}>
      <label className="log-result__label">
        Competition
        <input
          type="text"
          name="competition"
          placeholder="Enter competition name"
          className="log-result__input"
          value={formData.competition}
          onChange={handleChange}
        />
      </label>

      <label className="log-result__label">
        Date
        <input
          type="date"
          name="date"
          className="log-result__input"
          value={formData.date}
          onChange={handleChange}
        />
      </label>

      <div className="log-result__events">
        <h4 className="log-result__events-title">Events</h4>
        {formData.events.map((event, index) => (
          <div key={index} className="log-result__event">
            <input
              type="text"
              placeholder="Event name"
              className="log-result__input"
              value={event.name}
              onChange={(e) => handleEventChange(index, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Performance"
              className="log-result__input"
              value={event.performance}
              onChange={(e) => handleEventChange(index, "performance", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="log-result__add-btn" onClick={addEvent}>
          + Add Event
        </button>
      </div>

      <button type="submit" className="log-result__submit-btn">Log Result</button>
    </form>
  );
}

function History() {
  return (
    <div className="history">
      <p>Your past results will appear here.</p>
    </div>
  );
}

function AppsRes() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "logResult":
        return <LogResult />;
      case "history":
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Header />
      <div className="apps-res">
        <div className="apps-res__text">
          <h1 className="apps-res__title">Competition Tracker</h1>
          <p className="apps-res__subtitle">
            Log all your results from different competitions or training sessions.
          </p>
        </div>

        <div className="apps-res__tabs">
          <ul className="apps-res__tabs-list">
            {["dashboard", "logResult", "history"].map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`apps-res__tab ${activeTab === tab ? "apps-res__tab--active" : ""}`}
              >
                {tab === "dashboard" ? "Dashboard" : tab === "logResult" ? "Log Result" : "History"}
              </li>
            ))}
          </ul>

          <div className="apps-res__tab-content">{renderTab()}</div>
        </div>
      </div>
    </>
  );
}

export default AppsRes;