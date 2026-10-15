import { FaProjectDiagram, FaTrash, FaPlus } from "react-icons/fa";

import "./ProjectsSection.css";

function ProjectsSection({
  projects,
  setProfile,
}) {

  const handleChange = (index, value) => {

    const updatedProjects = [...projects];

    updatedProjects[index] = value;

    setProfile((prev) => ({
      ...prev,
      projects: updatedProjects,
    }));
  };


  const handleDelete = (index) => {

    const updatedProjects =
      projects.filter((_, i) => i !== index);

    setProfile((prev) => ({
      ...prev,
      projects: updatedProjects,
    }));
  };


  const handleAdd = () => {

    setProfile((prev) => ({
      ...prev,

      projects: [
        ...(prev.projects || []),
        "",
      ],
    }));
  };


  return (
    <div className="projects-section">

      <div className="section-header">

        <div>
          <h2>
            <FaProjectDiagram />
            Projects
          </h2>

          <p>
            Projects extracted from your resume.
            You can edit them before saving.
          </p>
        </div>

        <button
          className="add-project-btn"
          onClick={handleAdd}
        >
          <FaPlus />
          Add Project
        </button>

      </div>


      <div className="projects-list">

        {projects.length === 0 ? (

          <div className="empty-projects">
            <FaProjectDiagram />

            <h3>No Projects Added</h3>

            <p>
              Analyze your resume or add a project manually.
            </p>

          </div>

        ) : (

          projects.map((project, index) => (

            <div
              className="project-card"
              key={index}
            >

              <div className="project-number">
                {index + 1}
              </div>

              <textarea
                value={project}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                placeholder="Enter project details..."
              />

              <button
                className="delete-project-btn"
                onClick={() =>
                  handleDelete(index)
                }
              >
                <FaTrash />
              </button>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default ProjectsSection;