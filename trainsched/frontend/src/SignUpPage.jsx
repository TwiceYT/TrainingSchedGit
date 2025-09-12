import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", { username, password });
      alert("Signup successful! Please login.");
      navigate("/login"); // redirect to login page
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="signup-page">
      <h1 className="signup-page__title">Sign Up</h1>

      <div className="signup-page__form">
        <label className="signup-page__label">Username</label>
        <input
          className="signup-page__input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="signup-page__label">Password</label>
        <input
          className="signup-page__input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="signup-page__label">Confirm Password</label>
        <input
          className="signup-page__input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="signup-page__error">{error}</p>}

        <button className="signup-page__button" onClick={handleSignup}>
          Sign Up
        </button>
      </div>
    </div>
  );
}
