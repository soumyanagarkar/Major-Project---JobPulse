import "./Hero.css";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaPlay,
  FaRobot,
  FaChartLine,
  FaBriefcase,
  FaGraduationCap,
  FaCheckCircle,
  FaBolt,
} from "react-icons/fa";

function Hero() {
  return (
    <section className="hero">

      {/* Background Blur Effects */}
      <div className="hero-bg bg1"></div>
      <div className="hero-bg bg2"></div>

      <div className="hero-container">

        {/* ================= LEFT ================= */}

        <div className="hero-left">

          <div className="hero-badge">
            <FaRobot />
            <span>AI Powered Career Intelligence Platform</span>
          </div>

          <h1>
            Land Your
            <span> Dream Job </span>
            Faster with AI
          </h1>

          <p>
            Analyze your resume, discover high-quality job opportunities,
            identify missing skills, and prepare for interviews using one
            intelligent career platform.
          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="hero-primary">
              Get Started
              <FaArrowRight />
            </Link>

            <button className="hero-secondary">
              <FaPlay />
              Watch Demo
            </button>

          </div>

          <div className="hero-stats">

            <div className="stat-box">
              <h2>10K+</h2>
              <span>Students</span>
            </div>

            <div className="stat-box">
              <h2>95%</h2>
              <span>Resume Accuracy</span>
            </div>

            <div className="stat-box">
              <h2>24/7</h2>
              <span>AI Support</span>
            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="hero-right">

          <div className="dashboard">

            <div className="dashboard-header">

              <h3>Career Dashboard</h3>

              <div className="online-dot"></div>

            </div>

            <div className="score-grid">

              <div className="score-card">

                <FaChartLine className="dashboard-icon"/>

                <h4>Resume Score</h4>

                <h1>92%</h1>

                <p>
                  <FaCheckCircle />
                  ATS Friendly
                </p>

              </div>

              <div className="score-card">

                <FaBolt className="dashboard-icon"/>

                <h4>Career Score</h4>

                <h1>88%</h1>

                <p>Excellent Progress</p>

              </div>

            </div>

            <div className="dashboard-card">

              <div className="card-title">

                <FaGraduationCap />

                Skill Gap Analysis

              </div>

              <div className="skills">

                <span>Docker</span>

                <span>AWS</span>

                <span>Kubernetes</span>

              </div>

            </div>

            <div className="dashboard-card">

              <div className="card-title">

                <FaBriefcase />

                Recommended Jobs

              </div>

              <div className="job">

                <div>
                  <h5>Frontend Developer</h5>
                  <small>Match Score</small>
                </div>

                <strong>94%</strong>

              </div>

              <div className="job">

                <div>
                  <h5>React Developer</h5>
                  <small>Match Score</small>
                </div>

                <strong>90%</strong>

              </div>

            </div>

          </div>

          {/* Floating Cards */}

          <div className="floating-card floating-one">
            🤖 AI Resume Analysis
          </div>

          <div className="floating-card floating-two">
            🎯 Smart Job Match
          </div>

          <div className="floating-card floating-three">
            🚀 Career Roadmap
          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;