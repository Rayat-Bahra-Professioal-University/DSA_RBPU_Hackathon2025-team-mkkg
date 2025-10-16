import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [dots, setDots] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    closed: 0,
    inProgress: 0,
  });

  useEffect(() => {
    // Generate random dots for the globe effect
    const generateDots = () => {
      const newDots = [];
      for (let i = 0; i < 100; i++) {
        newDots.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3,
        });
      }
      setDots(newDots);
    };
    generateDots();

    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
        const response = await fetch(`${API_URL}/complaints/stats`);
        if (response.ok) {
          const data = await response.json();
          console.log("Stats from backend:", data);
          setStats({
            total: data.total || 1247,
            pending: data.pending || 342,
            closed: data.closed || 850,
            inProgress: data.inProgress || 55,
          });
        } else {
          console.log("Backend response not ok:", response.status);
        }
      } catch (error) {
        console.log("Error fetching stats - using defaults:", error.message);
      }
    };
    fetchStats();
  }, []);

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate("/dashboard");
    } else {
      window.location.href = "https://smart-hippo-27.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A5173%2Fdashboard";
    }
  };

  const handleCreateIssue = () => {
    if (isSignedIn) {
      navigate("/create-issue");
    } else {
      navigate("/sign-in");
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span>🌿</span>
          <span>City</span>Care
        </div>
        <div className="nav-buttons">
          <button className="btn-login" onClick={() => window.location.href = "https://smart-hippo-27.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A5173%2Fdashboard"}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Civic Complaint Management</span>
          <h1 className="hero-title">
            Civic Issues In <span className="highlight">Seconds</span>
            <br />
            <span className="secondary">Not In Minutes</span>
          </h1>
          <p className="hero-description">
            Revolutionized how citizens report civic problems, making it more
            personal, efficient, and impactful. Your voice matters in building a
            better community.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started →
            </button>
            <button
              className="btn-secondary"
              onClick={() =>
                navigate("/create-issue")
              }
            >
              Create Issue
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="globe-container">
            <div className="globe-dots">
              {dots.map((dot) => (
                <div
                  key={dot.id}
                  className="dot"
                  style={{
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    animationDelay: `${dot.delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        {/* <section id="features" className="features-section"> */}
        <div className="section-header">
          <span className="section-badge">Features</span>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3 className="feature-title">Easy Reporting</h3>
            <p className="feature-description">
              Report civic issues with photos, location, and detailed
              descriptions in seconds
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3 className="feature-title">Location Tracking</h3>
            <p className="feature-description">
              Automatic location detection with interactive maps for precise
              issue reporting
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3 className="feature-title">Photo Evidence</h3>
            <p className="feature-description">
              Upload photos or capture images directly to document civic
              problems effectively
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3 className="feature-title">Voice to Text</h3>
            <p className="feature-description">
              Use voice input to quickly describe issues - perfect for on-the-go
              reporting
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3 className="feature-title">Secure Authentication</h3>
            <p className="feature-description">
              Protected access with modern authentication ensuring your data
              privacy and security
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Admin Dashboard</h3>
            <p className="feature-description">
              Comprehensive admin panel for managing complaints, teams, and
              resolutions
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Search & Filter</h3>
            <p className="feature-description">
              Advanced search capabilities to find and track issues by category,
              status, and location
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Analytics Dashboard</h3>
            <p className="feature-description">
              Visualize complaint trends and resolution statistics with
              interactive charts
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="section-header">
          <span className="section-badge">How It Works</span>
        </div>

        <div className="timeline">
          <div className="timeline-item timeline-left">
            <div className="timeline-content">
              <h3 className="timeline-title">Report Issue</h3>
              <p className="timeline-description">
                Citizens report civic problems with photos, location, and
                detailed description. Issues are automatically categorized and
                prioritized.
              </p>
            </div>
            <div className="timeline-number">1</div>
          </div>

          <div className="timeline-item timeline-right">
            <div className="timeline-number">2</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Admin Review</h3>
              <p className="timeline-description">
                Admin team reviews the complaint, verifies details, and assigns
                it to the appropriate inspection team based on category and
                urgency.
              </p>
            </div>
          </div>

          <div className="timeline-item timeline-left">
            <div className="timeline-content">
              <h3 className="timeline-title">Team Inspection</h3>
              <p className="timeline-description">
                Assigned inspection team visits the location, assesses the
                situation, and documents findings with photos and reports.
              </p>
            </div>
            <div className="timeline-number">3</div>
          </div>

          <div className="timeline-item timeline-right">
            <div className="timeline-number">4</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Resolution</h3>
              <p className="timeline-description">
                Concerned department takes action to resolve the issue. Progress
                updates are shared with citizens in real-time.
              </p>
            </div>
          </div>

          <div className="timeline-item timeline-left">
            <div className="timeline-content">
              <h3 className="timeline-title">Issue Closed</h3>
              <p className="timeline-description">
                Once resolved, the issue is marked as closed. Citizens receive
                notification and can provide feedback on the resolution quality.
              </p>
            </div>
            <div className="timeline-number">5</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{stats.total}+</div>
            <div className="stat-label">Total Issues</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Issues</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.closed}+</div>
            <div className="stat-label">Issues Resolved</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌿 CityCare</h3>
            <p>
              Empowering citizens to create positive change in their communities
              through efficient civic complaint management and resolution.
            </p>
            <div className="social-links">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaGithub />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#" onClick={handleGetStarted}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" onClick={handleCreateIssue}>
                  Report Issue
                </a>
              </li>
              <li>
                <a href="#" onClick={() => navigate("/search-complaints")}>
                  Search Issues
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">FAQ</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Community Guidelines</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Legal</h3>
            <ul className="footer-links">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
              <li>
                <a href="#">Accessibility</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} CityCare. All rights reserved. Built
            for DSA RBPU Hackathon 2025
          </div>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
