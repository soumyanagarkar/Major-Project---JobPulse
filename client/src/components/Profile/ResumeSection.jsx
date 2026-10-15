import { useRef } from "react";

import {
  FaFilePdf,
  FaUpload,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import "./ResumeSection.css";

function ResumeSection({
  profile,
  pendingResume,
  resumeDeletePending,
  handleResumeUpload,
  handleDeleteResume,
  handleParseResume,
  parsingResume,
}) {
  const fileInputRef = useRef(null);

  // ==========================================
  // Resume state
  // ==========================================

  const hasSavedResume = Boolean(profile?.resume);

  const hasPendingResume = Boolean(pendingResume);

  const hasResume =
    hasSavedResume || hasPendingResume;

  // ==========================================
  // Resume name
  // ==========================================

  const resumeName = hasPendingResume
    ? pendingResume.name
    : profile?.resumeName ||
      (profile?.resume
        ? profile.resume.split("/").pop()
        : "No Resume Uploaded");

  // ==========================================
  // Resume size
  // ==========================================

  const resumeSize = hasPendingResume
    ? pendingResume.size
    : profile?.resumeSize || 0;

  const formattedSize = resumeSize
    ? `${(resumeSize / 1024).toFixed(1)} KB`
    : "--";

  // ==========================================
  // Upload date
  // ==========================================

  const uploadedDate = hasPendingResume
    ? "Pending Save"
    : profile?.updatedAt
      ? new Date(profile.updatedAt).toLocaleDateString()
      : "--";

  // ==========================================
  // Status
  // ==========================================

  const isUploaded =
    hasSavedResume && !resumeDeletePending;

  const isPending =
    hasPendingResume && !hasSavedResume;

  return (
    <div className="resume-section">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="resume-header">

        <h2>
          Resume Management
        </h2>

        <p>
          Upload your latest resume to improve AI
          recommendations, ATS score and job matching.
        </p>

      </div>


      {/* =====================================
          RESUME CARD
      ===================================== */}

      <div className="resume-card">

        <div className="resume-icon">
          <FaFilePdf />
        </div>


        <div className="resume-details">

          {/* Resume name */}

          <div className="resume-title">
            <h3>
              {resumeName}
            </h3>
          </div>


          {/* Resume information */}

          <div className="resume-info">

            {/* Uploaded */}

            <div className="info-box">

              <span>
                Uploaded
              </span>

              <strong>
                {uploadedDate}
              </strong>

            </div>


            {/* File Size */}

            <div className="info-box">

              <span>
                File Size
              </span>

              <strong>
                {formattedSize}
              </strong>

            </div>


            {/* Status */}

            <div className="info-box">

              <span>
                Status
              </span>


              {isUploaded && (
                <strong className="success">
                  <FaCheckCircle />
                  Uploaded
                </strong>
              )}


              {isPending && (
                <strong className="pending">
                  <FaCheckCircle />
                  Ready to Save
                </strong>
              )}


              {!hasResume && (
                <strong className="not-uploaded">
                  <FaTimesCircle />
                  Not Uploaded
                </strong>
              )}

            </div>

          </div>

        </div>

      </div>





      {/* =====================================
          ACTIONS
      ===================================== */}

      <div className="resume-actions">

        {/* Upload */}

        <button
          type="button"
          className="upload-btn"
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <FaUpload />

          {hasResume
            ? "Replace Resume"
            : "Upload Resume"}
        </button>


        {/* Hidden input */}

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            handleResumeUpload(e);
          }}
        />


        {/* Download */}

        {hasSavedResume &&
          !resumeDeletePending && (
            <a
              href={`http://localhost:5000/uploads/resumes/${profile.resume}`}
              target="_blank"
              rel="noreferrer"
              className="download-btn"
            >
              <FaDownload />
              Download Resume
            </a>
          )}
{hasSavedResume && !resumeDeletePending && (
  <button
    type="button"
    className="analyze-btn"
    onClick={handleParseResume}
    disabled={parsingResume}
  >
    {parsingResume ? "Analyzing Resume..." : "Analyze Resume"}
  </button>
)}

        {/* Delete */}

        {hasResume && (
          <button
            type="button"
            className="delete-btn"
            onClick={handleDeleteResume}
          >
            <FaTrash />
            Delete Resume
          </button>
        )}

      </div>


      {/* =====================================
          PENDING MESSAGE
      ===================================== */}

      {isPending && (
        <div className="resume-pending-message">
          Resume selected.{" "}
          <strong>
            Click "Save Changes"
          </strong>{" "}
          to upload it.
        </div>
      )}

    </div>
  );
}

export default ResumeSection;
