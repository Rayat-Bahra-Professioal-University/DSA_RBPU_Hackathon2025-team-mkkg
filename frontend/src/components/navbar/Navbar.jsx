import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiHelpCircle,
  FiMessageCircle,
  FiMail,
} from "react-icons/fi";
import { UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem("theme") || "dark";
    setIsDarkMode(savedTheme === "dark");
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button
            className="mobile-menu-toggle"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="logo">
            <span className="logo-text">
              City<span style={{ color: "#22c55e" }}>Care</span>
            </span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-actions">
            <button className="navbar-icon-btn" aria-label="Help" title="Help">
              <FiHelpCircle />
            </button>

            <button className="navbar-icon-btn" aria-label="FAQ" title="FAQ">
              <FiMessageCircle />
            </button>

            <button
              className="navbar-icon-btn"
              aria-label="Contact Us"
              title="Contact Us"
            >
              <FiMail />
            </button>

            <button
              className="navbar-icon-btn theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>

          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
