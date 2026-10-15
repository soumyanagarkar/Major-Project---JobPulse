const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {
  sendResetPasswordEmail,
} = require("../utils/emailService");

// ======================================================
// SIGNUP
// ======================================================

exports.signup = async (req, res) => {
  try {
    let {
      fullName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    } = req.body;

    // ==================================================
    // 1. REQUIRED FIELD VALIDATION
    // ==================================================

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ==================================================
    // 2. NORMALIZE INPUT
    // ==================================================

    fullName = fullName
      .trim()
      .replace(/\s+/g, " ");

    email = email
      .trim()
      .toLowerCase();

    // ==================================================
    // 3. FULL NAME VALIDATION
    // ==================================================

    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    if (!nameRegex.test(fullName)) {
      return res.status(400).json({
        success: false,
        message: "Full Name can contain only letters and spaces.",
      });
    }

    if (fullName.length < 2 || fullName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Full Name must be between 2 and 50 characters.",
      });
    }

    // ==================================================
    // 4. GMAIL VALIDATION
    // ==================================================

    const gmailRegex =
      /^[A-Za-z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Gmail address ending with @gmail.com.",
      });
    }

    // ==================================================
    // 5. PASSWORD LENGTH
    // ==================================================

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    // ==================================================
    // 6. PASSWORD - UPPERCASE
    // ==================================================

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter.",
      });
    }

    // ==================================================
    // 7. PASSWORD - LOWERCASE
    // ==================================================

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one lowercase letter.",
      });
    }

    // ==================================================
    // 8. PASSWORD - NUMBER
    // ==================================================

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one number.",
      });
    }

    // ==================================================
    // 9. PASSWORD - SPECIAL CHARACTER
    // ==================================================

    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one special character (!@#$%^&*).",
      });
    }

    // ==================================================
    // 10. CONFIRM PASSWORD
    // ==================================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // ==================================================
    // 11. TERMS & CONDITIONS
    // ==================================================

    if (!acceptedTerms) {
      return res.status(400).json({
        success: false,
        message:
          "Please accept the Terms & Conditions.",
      });
    }

    // ==================================================
    // 12. CHECK EXISTING USER
    // ==================================================

    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // ==================================================
    // 13. HASH PASSWORD
    // ==================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==================================================
    // 14. CREATE USER
    // ==================================================

    const user = await User.create({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      acceptedTerms: acceptedTerms,
    });

    // ==================================================
    // 15. GENERATE JWT TOKEN
    // ==================================================

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ==================================================
    // 16. SUCCESS RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,
      message: "Account Created Successfully",
      token,
      user,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again.",
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ==================================================
    // 1. REQUIRED FIELD VALIDATION
    // ==================================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and Password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ==================================================
    // 2. FIND USER
    // ==================================================

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==================================================
    // 3. CHECK PASSWORD
    // ==================================================

    const isPasswordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password.",
      });
    }

    // ==================================================
    // 4. GENERATE JWT TOKEN
    // ==================================================

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ==================================================
    // 5. SUCCESS RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again.",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    /*
      Don't reveal whether the email exists.
      This is safer because attackers cannot use the
      endpoint to discover registered accounts.
    */

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token expires after 15 minutes
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    user.resetPasswordUsed = false;

    await user.save();

    const resetLink =
  `http://localhost:5173/login?resetToken=${resetToken}`;

    await sendResetPasswordEmail(
      user.email,
      resetLink
    );

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });

  } catch (error) {

    console.error("Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {

    const { token } = req.params;

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash token received from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpire: {
        $gt: Date.now(),
      },

      resetPasswordUsed: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    user.password = hashedPassword;

    // Invalidate reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.resetPasswordUsed = true;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });

  } catch (error) {

    console.error("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};