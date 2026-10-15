import "./Features.css";

import {
  FaBrain,
  FaBriefcase,
  FaRoad,
  FaRobot,
  FaArrowRight,
} from "react-icons/fa";

function Features() {
  return (
    <section className="features" id="features">

      <div className="features-header">

        <span>CORE FEATURES</span>

        <h2>
          Everything You Need
          <br />
          To Build Your Career
        </h2>

        <p>
          JobPulse AI combines artificial intelligence, career guidance,
          resume analysis and smart job discovery into one powerful platform.
        </p>

      </div>

      <div className="features-grid">

        <div className="feature-card">

          <div className="feature-icon">
            <FaBrain />
          </div>

          <h3>AI Career Intelligence</h3>

          <p>
            Analyze your profile, identify strengths,
            discover missing skills and receive AI-powered
            career insights.
          </p>

          <ul>
            <li>Career Score</li>
            <li>Resume Analysis</li>
            <li>Skill Gap Detection</li>
          </ul>

          <button>
            Learn More
            <FaArrowRight />
          </button>

        </div>

        <div className="feature-card">

          <div className="feature-icon">
            <FaBriefcase />
          </div>

          <h3>Smart Job Discovery</h3>

          <p>
            Find jobs from multiple platforms and
            receive AI-based match scores for every opportunity.
          </p>

          <ul>
            <li>Job Match Score</li>
            <li>Personalized Recommendations</li>
            <li>Remote & Hybrid Jobs</li>
          </ul>

          <button>
            Learn More
            <FaArrowRight />
          </button>

        </div>

        <div className="feature-card">

          <div className="feature-icon">
            <FaRoad />
          </div>

          <h3>Career Roadmap</h3>

          <p>
            Receive a personalized roadmap with projects,
            certifications, learning resources and skill plans.
          </p>

          <ul>
            <li>Learning Path</li>
            <li>Recommended Projects</li>
            <li>Certification Guide</li>
          </ul>

          <button>
            Learn More
            <FaArrowRight />
          </button>

        </div>

        <div className="feature-card">

          <div className="feature-icon">
            <FaRobot />
          </div>

          <h3>AI Career Copilot</h3>

          <p>
            Ask questions, improve your resume,
            prepare for interviews and receive
            instant AI career guidance.
          </p>

          <ul>
            <li>Resume Review</li>
            <li>Interview Preparation</li>
            <li>Career Assistant</li>
          </ul>

          <button>
            Learn More
            <FaArrowRight />
          </button>

        </div>

      </div>

    </section>
  );
}

export default Features;