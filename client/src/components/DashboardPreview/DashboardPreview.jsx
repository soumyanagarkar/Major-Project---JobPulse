import "./DashboardPreview.css";

import {
  FaChartLine,
  FaFileAlt,
  FaBriefcase,
  FaGraduationCap,
  FaTasks,
  FaRobot,
  FaArrowRight,
} from "react-icons/fa";

function DashboardPreview() {
  return (
    <section className="dashboard-preview">

      <div className="showcase-header">

        <span>DASHBOARD EXPERIENCE</span>

        <h2>
          Your AI Powered
          <br />
          Career Dashboard
        </h2>

        <p>
          Everything you need to manage your career journey in one
          intelligent dashboard. Track progress, improve your resume,
          discover opportunities and grow faster.
        </p>

      </div>

      <div className="dashboard-window">

        <div className="window-top">

          <div className="window-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <h4>JobPulse AI Dashboard</h4>

        </div>

        <div className="dashboard-grid">

          <div className="dashboard-box">
            <FaChartLine />
            <h3>Career Score</h3>
            <h1>88%</h1>
            <small>Excellent Progress</small>
          </div>

          <div className="dashboard-box">
            <FaFileAlt />
            <h3>Resume Score</h3>
            <h1>92%</h1>
            <small>ATS Optimized</small>
          </div>

          <div className="dashboard-box">
            <FaBriefcase />
            <h3>Recommended Jobs</h3>
            <h1>34</h1>
            <small>Updated Daily</small>
          </div>

          <div className="dashboard-box">
            <FaGraduationCap />
            <h3>Skill Gap</h3>

            <div className="skill-tags">
              <span>Docker</span>
              <span>AWS</span>
              <span>Node.js</span>
            </div>

          </div>

          <div className="dashboard-box">
            <FaTasks />
            <h3>Learning Progress</h3>

            <div className="progress">

              <div className="progress-fill"></div>

            </div>

            <small>68% Completed</small>

          </div>

          <div className="dashboard-box">
            <FaRobot />
            <h3>AI Suggestions</h3>

            <ul>

              <li>Improve Resume Summary</li>

              <li>Add AWS Project</li>

              <li>Practice React Interview</li>

            </ul>

          </div>

        </div>

      </div>

      <div className="dashboard-bottom">

        <button>

          Explore Dashboard

          <FaArrowRight />

        </button>

      </div>

    </section>
  );
}

export default DashboardPreview;