const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const {
  extractResumeText,
  parseResume,
} = require("../utils/resumeParser");


// =====================================================
// UPLOAD RESUME
// =====================================================

exports.uploadResume = async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "No Resume Uploaded",
      });

    }

    const user = await User.findByIdAndUpdate(

      req.user.id,

      {
        resume: req.file.filename,

        resumeOriginalName: req.file.originalname,

        resumeSize: req.file.size,
      },

      {
        new: true,
      }

    );

    res.status(200).json({

      success: true,

      message: "Resume Uploaded Successfully",

      file: req.file.filename,

      user,

    });

  } catch (error) {

    console.error("Resume upload error:", error);

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// =====================================================
// DELETE RESUME
// =====================================================

exports.deleteResume = async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    if (!user.resume) {

      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });

    }


    const resumePath = path.join(

      __dirname,

      "../uploads/resumes",

      user.resume

    );


    if (fs.existsSync(resumePath)) {

      fs.unlinkSync(resumePath);

    }


    // Clear resume information

    user.resume = "";

    user.resumeOriginalName = "";

    user.resumeSize = 0;

    user.resumeText = "";
    user.resumeSkills = [];


    await user.save();


    res.status(200).json({

      success: true,

      message: "Resume Deleted Successfully",

      user,

    });


  } catch (error) {

    console.error("Resume delete error:", error);

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// =====================================================
// ANALYZE / PARSE RESUME
// =====================================================

exports.parseResume = async (req, res) => {

  try {

    const user = await User.findById(req.user.id);


    // ---------------------------------------------
    // USER CHECK
    // ---------------------------------------------

    if (!user) {

      return res.status(404).json({

        success: false,

        message: "User not found",

      });

    }


    // ---------------------------------------------
    // RESUME CHECK
    // ---------------------------------------------

    if (!user.resume) {

      return res.status(400).json({

        success: false,

        message: "Please upload a resume first",

      });

    }


    // ---------------------------------------------
    // RESUME PATH
    // ---------------------------------------------

    const resumePath = path.join(

      __dirname,

      "../uploads/resumes",

      user.resume

    );


    console.log(
      "Resume filename:",
      user.resume
    );

    console.log(
      "Resume path:",
      resumePath
    );

    console.log(
      "Resume exists:",
      fs.existsSync(resumePath)
    );


    // ---------------------------------------------
    // FILE CHECK
    // ---------------------------------------------

    if (!fs.existsSync(resumePath)) {

      return res.status(404).json({

        success: false,

        message: "Resume file not found on server",

      });

    }


    // ---------------------------------------------
    // EXTRACT TEXT
    // ---------------------------------------------

    const parsedResume = await parseResume(resumePath);

const resumeText = parsedResume.text;

const skills = parsedResume.skills;

const education = parsedResume.education;

const projects = parsedResume.projects;

const experience = parsedResume.experience;

const certifications = parsedResume.certifications;

const achievements = parsedResume.achievements;

const socialLinks = parsedResume.socialLinks;  

    // Make analyzed resume data available to job recommendations immediately.
    user.resumeText = resumeText;
    user.resumeSkills = skills;
    await user.save();


return res.status(200).json({

  success: true,

  message:
    "Resume analyzed successfully",

  text: resumeText,

  skills,
  education,
  projects,
  experience,
  certifications,
  achievements,
  socialLinks,

});


  } catch (error) {

    console.error(
      "================================"
    );

    console.error(
      "RESUME PARSING ERROR:"
    );

    console.error(error);

    console.error(
      "================================"
    );


    return res.status(500).json({

      success: false,

      message: "Failed to parse resume",

      error: error.message,

    });

  }

};
