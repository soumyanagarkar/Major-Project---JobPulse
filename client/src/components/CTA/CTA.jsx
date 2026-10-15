import "./CTA.css";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

function CTA() {
  return (
    <section className="cta">

      <div className="cta-bg"></div>

      <div className="cta-content">

        <span>START YOUR CAREER JOURNEY</span>

        <h2>
          Let AI Guide You To
          <br />
          Your Dream Career
        </h2>

        <p>
          Join thousands of students and job seekers using JobPulse AI
          to improve resumes, discover better opportunities, identify
          skill gaps, and accelerate their careers.
        </p>

        <div className="cta-points">

          <div>
            <FaCheckCircle />
            AI Resume Analysis
          </div>

          <div>
            <FaCheckCircle />
            Personalized Career Roadmap
          </div>

          <div>
            <FaCheckCircle />
            Smart Job Recommendations
          </div>

          <div>
            <FaCheckCircle />
            AI Career Copilot
          </div>

        </div>

        <div className="cta-buttons">

          <Link
            to="/signup"
            className="primary-btn"
          >
            Create Free Account
            <FaArrowRight />
          </Link>

          <Link
            to="/login"
            className="secondary-btn"
          >
            Login
          </Link>

        </div>

        <div className="cta-stats">

          <div>

            <h3>10K+</h3>

            <span>Career Insights</span>

          </div>

          <div>

            <h3>500+</h3>

            <span>Companies</span>

          </div>

          <div>

            <h3>95%</h3>

            <span>AI Accuracy</span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default CTA;