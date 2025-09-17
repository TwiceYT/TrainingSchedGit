import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- import
import "./assets/css/LoginPage.scss";
import Header from "./header";


export default function LoginPage({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // <-- hook for navigation

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", { username, password });
      const token = res.data.token;
      setToken(token);
      localStorage.setItem("token", token);
      navigate("/"); // <-- redirect to SchedulePage
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <>
    <Header />
    <div className="loginPage">
      <h1 className="loginPage__title">Login</h1>
        <main className="loginPage__main">
          <p className="loginPage__main--loginp">Username</p>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="loginPage__main--placeholer"/>
          <p className="loginPage__main--loginp">Password</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="loginPage__main--placeholer"/>
          <button onClick={login} className="loginPage__main--button">Login</button>
        </main>
      
    </div>
  </>
  );
}
