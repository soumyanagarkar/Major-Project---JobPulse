import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaCode,
} from "react-icons/fa";

import "./SocialLinksSection.css";

function SocialLinksSection({ profile, handleChange }) {
  return (
    <div className="social-section">

      <div className="social-header">
        <h2>Social Links</h2>

        <p>
          Add your professional and coding profiles to help recruiters
          discover your work.
        </p>
      </div>

      <div className="social-card">

        {/* GitHub */}
        <div className="social-input-group">

          <label>
            <FaGithub />
            GitHub
          </label>

          <input
            type="text"
            name="github"
            value={profile.github || ""}
            onChange={handleChange}
            placeholder="https://github.com/username"
          />

        </div>

        {/* LinkedIn */}
        <div className="social-input-group">

          <label>
            <FaLinkedin />
            LinkedIn
          </label>

          <input
            type="text"
            name="linkedin"
            value={profile.linkedin || ""}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
          />

        </div>

        {/* Portfolio */}
        <div className="social-input-group">

          <label>
            <FaGlobe />
            Portfolio Website
          </label>

          <input
            type="text"
            name="portfolio"
            value={profile.portfolio || ""}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
          />

        </div>

        {/* LeetCode */}
        <div className="social-input-group">

          <label>
            <FaCode />
            LeetCode
          </label>

          <input
            type="text"
            name="leetcode"
            value={profile.leetcode || ""}
            onChange={handleChange}
            placeholder="https://leetcode.com/username"
          />

        </div>

      </div>

    </div>
  );
}

export default SocialLinksSection;