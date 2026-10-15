import { FaCode, FaPlus, FaTimes } from "react-icons/fa";

import "./SkillsSection.css";

function SkillsSection({
  profile,
  setProfile,
  onAddSkill,
}) {

  const skills = profile.skills || [];

  const handleAddSkill = () => {

    const skill = window.prompt("Enter a skill:");

    if (!skill || !skill.trim()) return;

    const newSkill = skill.trim();

    if (
      skills.some(
        (existingSkill) =>
          existingSkill.toLowerCase() === newSkill.toLowerCase()
      )
    ) {
      alert("This skill already exists.");
      return;
    }

    setProfile({
      ...profile,
      skills: [...skills, newSkill],
    });
  };


  const handleRemoveSkill = (index) => {

    const updatedSkills = skills.filter(
      (_, skillIndex) => skillIndex !== index
    );

    setProfile({
      ...profile,
      skills: updatedSkills,
    });
  };


  return (

    <div className="skills-section">

      {/* Header */}

      <div className="skills-header">

        <div>

          <div className="skills-title">

            <div className="skills-title-icon">
              <FaCode />
            </div>

            <div>
              <h2>Skills</h2>

              <p>
                Skills extracted from your resume.
                You can edit them before saving.
              </p>
            </div>

          </div>

        </div>

        <button
          className="add-skill-btn"
          onClick={handleAddSkill}
        >
          <FaPlus />
          Add Skill
        </button>

      </div>


      {/* Skills */}

      <div className="skills-card">

        {skills.length === 0 ? (

          <div className="empty-skills">

            <FaCode />

            <h3>No Skills Added</h3>

            <p>
              Upload a resume or add your skills manually.
            </p>

            <button
              onClick={handleAddSkill}
              className="empty-add-btn"
            >
              <FaPlus />
              Add Your First Skill
            </button>

          </div>

        ) : (

          <div className="skills-list">

            {skills.map((skill, index) => (

              <div
                className="skill-tag"
                key={`${skill}-${index}`}
              >

                <span>
                  {skill}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  title="Remove skill"
                >
                  <FaTimes />
                </button>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* Information */}

      <div className="skills-info">

        <strong>
          💡 Tip
        </strong>

        <span>
          Keep your skills relevant to your target role.
          These skills will be used for AI job matching.
        </span>

      </div>

    </div>

  );
}

export default SkillsSection;