import "./AIDemo.css";

import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

function AIDemo() {
  return (
    <section className="copilot">

      <div className="copilot-header">

        <span>AI CAREER COPILOT</span>

        <h2>
          Your Personal
          <br />
          AI Career Assistant
        </h2>

        <p>
          Ask anything about your career, resume, interview preparation,
          or learning roadmap. Get personalized AI-powered guidance instantly.
        </p>

      </div>

      <div className="chat-window">

        <div className="chat-header">

          <div className="bot-info">

            <div className="bot-avatar">
              <FaRobot />
            </div>

            <div>

              <h3>JobPulse AI Copilot</h3>

              <small>Online • Ready to help</small>

            </div>

          </div>

        </div>

        <div className="chat-body">

          <div className="message user">

            <div className="avatar">
              <FaUser />
            </div>

            <div className="bubble">

              How can I improve my resume for a Software Engineer role?

            </div>

          </div>

          <div className="message ai">

            <div className="avatar">
              <FaRobot />
            </div>

            <div className="bubble">

              <h4>Resume Match Score</h4>

              <div className="score-circle">
                82%
              </div>

              <div className="suggestions">

                <div>
                  <FaCheckCircle />
                  Add Docker & Kubernetes skills
                </div>

                <div>
                  <FaCheckCircle />
                  Quantify project achievements
                </div>

                <div>
                  <FaCheckCircle />
                  Improve your resume summary
                </div>

                <div>
                  <FaCheckCircle />
                  Include GitHub portfolio link
                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="chat-input">

          <input
            type="text"
            placeholder="Ask your AI Career Copilot..."
            disabled
          />

          <button>

            <FaPaperPlane />

          </button>

        </div>

      </div>

    </section>
  );
}

export default AIDemo;