import "./WhyJobPulse.css";

import {
  FaTimesCircle,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

function WhyJobPulse() {
  return (
    <section className="why-jobpulse">

      <div className="why-header">

        <span>WHY JOBPULSE AI?</span>

        <h2>
          More Than Just
          <br />
          A Job Portal
        </h2>

        <p>
          Traditional job platforms only show job listings.
          JobPulse AI helps you become the candidate companies
          actually want to hire.
        </p>

      </div>

      <div className="comparison-table">

        <div className="table-header old">
          Traditional Job Portals
        </div>

        <div className="table-header new">
          JobPulse AI
        </div>

        <div className="table-row">

          <div className="old-cell">
            <FaTimesCircle />
            Search jobs manually
          </div>

          <div className="new-cell">
            <FaCheckCircle />
            AI discovers relevant jobs automatically
          </div>

        </div>

        <div className="table-row">

          <div className="old-cell">
            <FaTimesCircle />
            Same resume for every company
          </div>

          <div className="new-cell">
            <FaCheckCircle />
            AI resume optimization
          </div>

        </div>

        <div className="table-row">

          <div className="old-cell">
            <FaTimesCircle />
            No career roadmap
          </div>

          <div className="new-cell">
            <FaCheckCircle />
            Personalized learning roadmap
          </div>

        </div>

        <div className="table-row">

          <div className="old-cell">
            <FaTimesCircle />
            No interview preparation
          </div>

          <div className="new-cell">
            <FaCheckCircle />
            AI interview practice
          </div>

        </div>

        <div className="table-row">

          <div className="old-cell">
            <FaTimesCircle />
            No career analytics
          </div>

          <div className="new-cell">
            <FaCheckCircle />
            Career Score & Skill Gap Analysis
          </div>

        </div>

      </div>

      <div className="why-footer">

        <button>

          Experience JobPulse AI

          <FaArrowRight />

        </button>

      </div>

    </section>
  );
}

export default WhyJobPulse;