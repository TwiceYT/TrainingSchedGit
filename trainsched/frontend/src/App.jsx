
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import SchedulePage from "./SchedulePage";
import SignupPage from "./SignUpPage";
import Results from "./Result";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route
          path="/"
          element={
            token && !isTokenExpired(token) ? (
              <SchedulePage token={token} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/results"  element={
            token && !isTokenExpired(token) ? (
              <Results token={token} />
            ) : (
              <Navigate to="/login" />
            )
          } />

      </Routes>
    </Router>
  );
}
