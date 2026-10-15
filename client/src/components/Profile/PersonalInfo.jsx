import "./PersonalInfo.css";

function PersonalInfo({
  profile,
  setProfile,
  handleSave
}) {

  const handleChange = (e)=>{
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };


  return (
    <div className="personal-info-section">

      <div className="section-header">
        <h2>Personal Information</h2>
        <p>
          Update your basic personal details
        </p>
      </div>


      <div className="personal-form">


        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            name="fullName"
            value={profile.fullName || ""}
            onChange={handleChange}
          />

        </div>



        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={profile.email || ""}
            disabled
          />

        </div>



        <div className="form-group">
          <label>Phone Number</label>

          <input
            type="text"
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

        </div>



        <div className="form-group">
          <label>Bio</label>

          <textarea
            name="bio"
            value={profile.bio || ""}
            onChange={handleChange}
            placeholder="Tell something about yourself"
          />

        </div>


        <div className="form-row">


          <div className="form-group">

            <label>Target Role</label>

            <input
              type="text"
              name="targetRole"
              value={profile.targetRole || ""}
              onChange={handleChange}
              placeholder="eg. Full Stack Developer"
            />

          </div>



          <div className="form-group">

            <label>Looking For</label>

            <select
              name="lookingFor"
              value={profile.lookingFor || ""}
              onChange={handleChange}
            >

              <option value="">
                Select
              </option>

              <option value="Internship">
                Internship
              </option>

              <option value="Full-Time">
                Full Time
              </option>

              <option value="Both">
                Both
              </option>

            </select>

          </div>


        </div>



        <div className="form-group">

          <label>
            Preferred Location
          </label>


          <input
            type="text"
            name="preferredLocation"
            value={profile.preferredLocation || ""}
            onChange={handleChange}
            placeholder="Mumbai, Pune, Remote"
          />


        </div>



        <div className="form-group">

          <label>
            Work Mode
          </label>


          <select
            name="preferredWorkMode"
            value={profile.preferredWorkMode || ""}
            onChange={handleChange}
          >

            <option value="">
              Select
            </option>

            <option value="Remote">
              Remote
            </option>

            <option value="Hybrid">
              Hybrid
            </option>

            <option value="On-site">
              On-site
            </option>

          </select>


        </div>



        <button
          className="save-profile-btn"
          onClick={handleSave}
        >
          Save Changes
        </button>


      </div>

    </div>
  );
}


export default PersonalInfo;