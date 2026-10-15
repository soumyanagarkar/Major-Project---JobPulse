import {
  FaGraduationCap,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import "./EducationSection.css";

function EducationSection({
  profile,
  setProfile,
}) {

  const education = Array.isArray(profile?.education)
    ? profile.education
    : [];


  // ==========================================
  // ADD EDUCATION
  // ==========================================

  const handleAddEducation = () => {

    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      grade: "",
    };

    setProfile((prev) => ({
      ...prev,

      education: [
        ...(Array.isArray(prev.education)
          ? prev.education
          : []),

        newEducation,
      ],
    }));
  };


  // ==========================================
  // UPDATE EDUCATION
  // ==========================================

  const handleChange = (index, field, value) => {

    setProfile((prev) => {

      const updatedEducation = [
        ...(Array.isArray(prev.education)
          ? prev.education
          : []),
      ];

      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };

      return {
        ...prev,
        education: updatedEducation,
      };

    });
  };


  // ==========================================
  // DELETE EDUCATION
  // ==========================================

  const handleDelete = (index) => {

    setProfile((prev) => ({

      ...prev,

      education: prev.education.filter(
        (_, educationIndex) =>
          educationIndex !== index
      ),

    }));

  };


  return (

    <div className="education-section">

      {/* HEADER */}

      <div className="education-header">

        <div className="education-heading">

          <div className="education-icon">
            <FaGraduationCap />
          </div>

          <div>

            <h2>Education</h2>

            <p>
              Education details extracted from your resume.
            </p>

          </div>

        </div>


        <button
          className="add-education-btn"
          onClick={handleAddEducation}
        >
          <FaPlus />
          Add Education
        </button>

      </div>


      {/* EDUCATION LIST */}

      {education.length === 0 ? (

        <div className="education-empty">

          <FaGraduationCap />

          <h3>No Education Added</h3>

          <p>
            Add your educational background or analyze your resume
            to extract it automatically.
          </p>

          <button
            className="empty-education-btn"
            onClick={handleAddEducation}
          >
            <FaPlus />
            Add Education
          </button>

        </div>

      ) : (

        <div className="education-list">

          {education.map((item, index) => (

            <div
              className="education-card"
              key={index}
            >

              <div className="education-card-header">

                <div className="education-card-icon">
                  <FaGraduationCap />
                </div>

                <div>

                  <h3>
                    {item.degree ||
                      "Education Details"}
                  </h3>

                  <p>
                    {item.institution ||
                      "Institution name"}
                  </p>

                </div>

                <button
                  type="button"
                  className="delete-education-btn"
                  onClick={() =>
                    handleDelete(index)
                  }
                  title="Delete education"
                >
                  <FaTrash />
                </button>

              </div>


              <div className="education-form">

                {/* INSTITUTION */}

                <div className="education-field full">

                  <label>
                    Institution
                  </label>

                  <input
                    type="text"
                    value={
                      item.institution || ""
                    }
                    placeholder="College / University / School"
                    onChange={(e) =>
                      handleChange(
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* DEGREE */}

                <div className="education-field">

                  <label>
                    Degree
                  </label>

                  <input
                    type="text"
                    value={
                      item.degree || ""
                    }
                    placeholder="e.g. B.Tech"
                    onChange={(e) =>
                      handleChange(
                        index,
                        "degree",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* FIELD */}

                <div className="education-field">

                  <label>
                    Field of Study
                  </label>

                  <input
                    type="text"
                    value={
                      item.field || ""
                    }
                    placeholder="e.g. Information Technology"
                    onChange={(e) =>
                      handleChange(
                        index,
                        "field",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* START DATE */}

                <div className="education-field">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="text"
                    value={
                      item.startDate || ""
                    }
                    placeholder="e.g. Aug 2023"
                    onChange={(e) =>
                      handleChange(
                        index,
                        "startDate",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* END DATE */}

                <div className="education-field">

                  <label>
                    End Date
                  </label>

                  <input
                    type="text"
                    value={
                      item.endDate || ""
                    }
                    placeholder="e.g. 2027"
                    onChange={(e) =>
                      handleChange(
                        index,
                        "endDate",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* GRADE */}

                <div className="education-field full">

                  <label>
                    Grade / CGPA / Percentage
                  </label>

                  <input
                    type="text"
                    value={
                      item.grade || ""
                    }
                    placeholder="e.g. CGPA 7.45/10"
                    onChange={(e) =>
                      handleChange(
                        index,
                        "grade",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

          ))}

        </div>

      )}


      <div className="education-info">

        <strong>💡 Tip</strong>

        <span>
          Keep your education details accurate because
          they can be used for job recommendations and
          career matching.
        </span>

      </div>

    </div>

  );
}

export default EducationSection;