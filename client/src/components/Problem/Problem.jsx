import "./Problem.css";

import {
  FaSearch,
  FaFileAlt,
  FaChartLine,
  FaBell,
} from "react-icons/fa";

function Problem() {
  return (
    <section className="problem" id="about">

      <div className="problem-header">

        <span>THE PROBLEM</span>

        <h2>
          Job Searching Shouldn't
          <br />
          Be This Hard
        </h2>

        <p>
          Thousands of students apply to hundreds of companies but
          still don't know why they aren't getting interview calls.
          JobPulse AI solves the biggest career challenges using AI.
        </p>

      </div>

      <div className="problem-grid">

        <div className="problem-card">

          <div className="problem-icon">
            <FaSearch />
          </div>

          <h3>Searching Multiple Portals</h3>

          <p>
            Students waste hours switching between LinkedIn,
            Indeed, Internshala and company career pages.
          </p>

        </div>

        <div className="problem-card">

          <div className="problem-icon">
            <FaFileAlt />
          </div>

          <h3>Same Resume Everywhere</h3>

          <p>
            One generic resume doesn't work for every company,
            reducing your interview chances.
          </p>

        </div>

        <div className="problem-card">

          <div className="problem-icon">
            <FaChartLine />
          </div>

          <h3>Unknown Skill Gaps</h3>

          <p>
            Students don't know which skills, certifications
            or projects recruiters actually expect.
          </p>

        </div>

        <div className="problem-card">

          <div className="problem-icon">
            <FaBell />
          </div>

          <h3>Missed Opportunities</h3>

          <p>
            New openings, deadlines and internship drives are
            often missed because everything is scattered.
          </p>

        </div>

      </div>

    </section>
  );
}

export default Problem;