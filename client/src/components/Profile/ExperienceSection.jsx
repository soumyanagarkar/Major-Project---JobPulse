import {
  FaBuilding,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import "./ExperienceSection.css";

function ExperienceSection({
  experience,
  setProfile,
}) {

  const handleChange = (index, value) => {

    const updatedExperience = [
      ...experience,
    ];

    updatedExperience[index] = value;

    setProfile((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };


  const handleDelete = (index) => {

    const updatedExperience =
      experience.filter(
        (_, i) => i !== index
      );

    setProfile((prev) => ({
      ...prev,
      experience: updatedExperience,
    }));
  };


  const handleAdd = () => {

    setProfile((prev) => ({
      ...prev,

      experience: [
        ...(prev.experience || []),
        "",
      ],
    }));
  };


  return (
    <div className="experience-section">

      <div className="experience-header">

        <div>

          <h2>
            <FaBuilding />
            Experience
          </h2>

          <p>
            Work experience extracted from your
            resume. You can edit or add experience
            before saving.
          </p>

        </div>

        <button
          className="add-experience-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Add Experience
        </button>

      </div>


      <div className="experience-list">

        {experience.length === 0 ? (

          <div className="empty-experience">

            <FaBuilding />

            <h3>
              No Experience Added
            </h3>

            <p>
              No work experience was found
              in your resume.
            </p>

            <button
              className="empty-add-btn"
              onClick={handleAdd}
            >
              <FaPlus />
              Add Experience
            </button>

          </div>

        ) : (

          experience.map(
            (item, index) => (

              <div
                className="experience-card"
                key={index}
              >

                <div className="experience-number">
                  {index + 1}
                </div>

                <textarea
                  value={item}
                  onChange={(e) =>
                    handleChange(
                      index,
                      e.target.value
                    )
                  }
                  placeholder="Enter your experience..."
                />

                <button
                  className="delete-experience-btn"
                  onClick={() =>
                    handleDelete(index)
                  }
                >
                  <FaTrash />
                </button>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default ExperienceSection;