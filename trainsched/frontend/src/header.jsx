import { Link } from "react-router-dom";
import "./assets/css/Header.scss";

function Header() {
  return (
    <header className="header">
      <h1>Training</h1>
      <ul className="header__nav">
        <li className="header__nav--item">
          <Link to="/" className="header__nav--item-link">Schedule</Link>
        </li>
        <li>
          <Link to="/results" className="header__nav--item-link">Results</Link>
        </li>
        <li>
          <Link to="/login" className="header__nav--item-link">Login</Link>
        </li>
        <li>
          <Link to="/signup" className="header__nav--item-link">Signup</Link>
        </li>
      </ul>
    </header>
  );
}

export default Header;
