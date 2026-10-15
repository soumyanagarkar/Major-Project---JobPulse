import { useState, useEffect } from "react";

import "./ProfileSidebar.css";

import {
  FaUser,
  FaFileAlt,
  FaBriefcase,
  FaCode,
  FaGraduationCap,
  FaProjectDiagram,
  FaBuilding,
  FaAward,
  FaLink,
  FaCamera,
} from "react-icons/fa";


function ProfileSidebar({
  profile,
  completion,
  fileInputRef,
  handlePhotoUpload,
  handleRemovePhoto,
  activeSection,
  setActiveSection,
}) {


  const [showPhotoModal, setShowPhotoModal] = useState(false);



  // Close modal using ESC key

  useEffect(()=>{

    const handleEsc = (e)=>{

      if(e.key === "Escape"){
        setShowPhotoModal(false);
      }

    };


    document.addEventListener(
      "keydown",
      handleEsc
    );


    return ()=>{
      document.removeEventListener(
        "keydown",
        handleEsc
      );
    };


  },[]);



  return (

    <aside className="profile-sidebar">


      <div className="sidebar-top">


        {/* Avatar */}

        <div
          className="profile-avatar"
          onClick={()=>setShowPhotoModal(true)}
        >


          {
            profile.profilePhoto ? (

              <img
                src={`http://localhost:5000${profile.profilePhoto}`}
                alt="Profile"
              />

            ) : (

              <span className="avatar-letter">

                {
                  profile.fullName
                  ?
                  profile.fullName.charAt(0).toUpperCase()
                  :
                  "U"
                }

              </span>

            )
          }



          <div className="camera-icon">
            <FaCamera/>
          </div>


        </div>




        {/* Hidden Upload Input */}

        <input

          type="file"

          accept="image/*"

          ref={fileInputRef}

          style={{
            display:"none"
          }}

          onChange={(e)=>{

            handlePhotoUpload(e);

            setShowPhotoModal(false);

          }}

        />




        {/* PHOTO MODAL */}


        {
          showPhotoModal && (

            <div

              className="photo-modal-overlay"

              onClick={()=>
                setShowPhotoModal(false)
              }

            >



              <div

                className="photo-modal"

                onClick={(e)=>
                  e.stopPropagation()
                }

              >



                <h3>
                  Profile Photo
                </h3>




                {/* Large Preview */}

                <div className="large-photo-preview">


                  {
                    profile.profilePhoto ? (

                      <img

                        src={`http://localhost:5000${profile.profilePhoto}`}

                        alt="Preview"

                      />

                    )
                    :
                    (

                      <span>

                        {
                          profile.fullName
                          ?
                          profile.fullName.charAt(0).toUpperCase()
                          :
                          "U"
                        }

                      </span>

                    )

                  }


                </div>




                <div className="photo-actions">


                  <button

                    className="upload-photo-btn"

                    onClick={()=>{

                      fileInputRef.current.click();

                    }}

                  >

                    📷 Upload New Photo

                  </button>





                  {
                    profile.profilePhoto && (

                      <button

                        className="remove-photo-btn"

                        onClick={()=>{

                          handleRemovePhoto();

                          setShowPhotoModal(false);

                        }}

                      >

                        🗑 Remove Photo

                      </button>

                    )
                  }






                  <button

                    className="cancel-photo-btn"

                    onClick={()=>setShowPhotoModal(false)}

                  >

                    Cancel

                  </button>



                </div>



              </div>



            </div>

          )
        }







        <h2>
          {profile.fullName}
        </h2>


        <p>
          {profile.email}
        </p>






        <div className="completion">


          <div className="completion-header">

            <span>
              Profile Completion
            </span>


            <span>
              {completion}%
            </span>


          </div>





          <div className="progress-bar">


            <div

              className="progress-fill"

              style={{
                width:`${completion}%`
              }}

            />


          </div>



        </div>




      </div>







      <ul className="sidebar-menu">


  {/* PERSONAL INFO */}
  <li
    className={activeSection === "personal" ? "active" : ""}
    onClick={() => setActiveSection("personal")}
  >
    <FaUser />
    <span>Personal Info</span>
  </li>


  {/* RESUME */}
  <li
    className={activeSection === "resume" ? "active" : ""}
    onClick={() => setActiveSection("resume")}
  >
    <FaFileAlt />
    <span>Resume</span>
  </li>


  {/* SKILLS */}
  <li
    className={activeSection === "skills" ? "active" : ""}
    onClick={() => setActiveSection("skills")}
  >
    <FaCode />
    <span>Skills</span>
  </li>


  {/* EDUCATION */}
  <li
    className={activeSection === "education" ? "active" : ""}
    onClick={() => setActiveSection("education")}
  >
    <FaGraduationCap />
    <span>Education</span>
  </li>


  {/* PROJECTS */}
  <li
    className={activeSection === "projects" ? "active" : ""}
    onClick={() => setActiveSection("projects")}
  >
    <FaProjectDiagram />
    <span>Projects</span>
  </li>


  {/* EXPERIENCE */}
  <li
    className={activeSection === "experience" ? "active" : ""}
    onClick={() => setActiveSection("experience")}
  >
    <FaBuilding />
    <span>Experience</span>
  </li>


  {/* CERTIFICATIONS */}
  <li
    className={activeSection === "certifications" ? "active" : ""}
    onClick={() => setActiveSection("certifications")}
  >
    <FaAward />
    <span>Certificates &amp; Achievements</span>
  </li>


  {/* SOCIAL LINKS */}
  <li
    className={activeSection === "social" ? "active" : ""}
    onClick={() => setActiveSection("social")}
  >
    <FaLink />
    <span>Social Links</span>
  </li>

</ul>



    </aside>

  );

}


export default ProfileSidebar;
