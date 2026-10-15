import "./Footer.css";

import { Link } from "react-router-dom";

import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaArrowUp,
} from "react-icons/fa";

function Footer() {

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-about">

          <h2>JobPulse AI</h2>

          <p>
            AI-powered Career Intelligence Platform helping students
            and professionals build stronger careers with resume
            analysis, personalized roadmaps, smart job discovery,
            and AI career guidance.
          </p>

          <div className="social-icons">

            <a href="#">
              <FaGithub />
            </a>

            <a href="#">
              <FaLinkedin />
            </a>

            <a href="#">
              <FaTwitter />
            </a>

            <a href="#">
              <FaInstagram />
            </a>

          </div>

        </div>

        <div className="footer-links">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>

          <a href="#features">Features</a>

          <a href="#how">How It Works</a>

          <a href="#about">About</a>

          <Link to="/login">Login</Link>

          <Link to="/signup">Sign Up</Link>

        </div>

        <div className="footer-links">

          <h3>Platform</h3>

          <a href="#">Career Dashboard</a>

          <a href="#">Resume Analyzer</a>

          <a href="#">AI Career Copilot</a>

          <a href="#">Career Roadmap</a>

          <a href="#">Job Recommendations</a>

        </div>

        <div className="footer-links">

          <h3>Support</h3>

          <a href="#">Contact Us</a>

          <a href="#">Privacy Policy</a>

          <a href="#">Terms of Service</a>

          <a href="#">Help Center</a>

          <a href="#">FAQs</a>

        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} JobPulse AI. All Rights Reserved.
        </p>

        <button
          className="top-btn"
          onClick={scrollTop}
        >
          <FaArrowUp />
        </button>

      </div>

    </footer>
  );
}

export default Footer;