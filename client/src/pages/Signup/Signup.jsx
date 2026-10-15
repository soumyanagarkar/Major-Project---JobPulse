import { useContext, useState } from "react";
import { SignupContext } from "../../context/SignupContext";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Signup.css";

function Signup() {
  const { signupData, setSignupData } = useContext(SignupContext);

  const navigate = useNavigate();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // Password visibility
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    // ==========================================
    // NORMALIZE INPUT
    // ==========================================

    const fullName = signupData.fullName
      .trim()
      .replace(/\s+/g, " ");

    const email = signupData.email
      .trim()
      .toLowerCase();

    const password = signupData.password;
    const confirmPassword = signupData.confirmPassword;

    // ==========================================
    // 1. REQUIRED FIELD VALIDATION
    // ==========================================

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }

    // ==========================================
    // 2. FULL NAME VALIDATION
    // ==========================================

    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    if (!nameRegex.test(fullName)) {
      setError("Full Name can contain only letters and spaces.");
      return;
    }

    if (fullName.length < 2 || fullName.length > 50) {
      setError("Full Name must be between 2 and 50 characters.");
      return;
    }

    // ==========================================
    // 3. GMAIL VALIDATION
    // ==========================================

    const gmailRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      setError("Please enter a valid Gmail address ending with @gmail.com.");
      return;
    }

    // ==========================================
    // 4. PASSWORD LENGTH
    // ==========================================

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // ==========================================
    // 5. PASSWORD - UPPERCASE
    // ==========================================

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    // ==========================================
    // 6. PASSWORD - LOWERCASE
    // ==========================================

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    // ==========================================
    // 7. PASSWORD - NUMBER
    // ==========================================

    if (!/[0-9]/.test(password)) {
      setError(
        "Password must contain at least one number."
      );
      return;
    }

    // ==========================================
    // 8. PASSWORD - SPECIAL CHARACTER
    // ==========================================

    if (!/[!@#$%^&*]/.test(password)) {
      setError(
        "Password must contain at least one special character (!@#$%^&*)."
      );
      return;
    }

    // ==========================================
    // 9. CONFIRM PASSWORD
    // ==========================================

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ==========================================
    // 10. TERMS & CONDITIONS
    // ==========================================

    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    // ==========================================
    // SEND DATA TO BACKEND
    // ==========================================

    try {
      setLoading(true);

      const response = await API.post("/auth/signup", {
        fullName,
        email,
        password,
        confirmPassword,
        acceptedTerms: termsAccepted,
      });

      setSuccess(response.data.message);

      // Clear form after successful signup
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTermsAccepted(false);

      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">

      <div className="signup-card">

        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <h1>JobPulse AI</h1>

        <p className="subtitle">
          Create your account and begin your AI-powered career journey.
        </p>

        <div className="step-indicator">
          <div className="active">1</div>
        </div>

        <h2>Create Account</h2>

        {/* Full Name */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={signupData.fullName}
          onChange={handleChange}
          maxLength={50}
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={signupData.email}
          onChange={handleChange}
        />

        {/* Password */}
<div className="password-input-container">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={signupData.password}
    onChange={handleChange}
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    )}
  </button>
</div>

        {/* Confirm Password */}
<div className="password-input-container">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    placeholder="Confirm Password"
    value={signupData.confirmPassword}
    onChange={handleChange}
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
    aria-label={
      showConfirmPassword
        ? "Hide confirm password"
        : "Show confirm password"
    }
  >
    {showConfirmPassword ? (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    )}
  </button>
</div>

        {/* Password Match Message */}
        {signupData.password !== "" &&
  signupData.confirmPassword !== "" && (
    signupData.password === signupData.confirmPassword ? (
      <p className="success-message">
        ✓ Passwords match
      </p>
    ) : (
      <p className="error-message">
        ✗ Passwords do not match
      </p>
    )
  )}

        {/* Terms & Conditions */}
        <label className="terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) =>
              setTermsAccepted(e.target.checked)
            }
          />

          I agree to the Terms & Conditions
        </label>

        {/* Error Message */}
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <p className="success-message">
            {success}
          </p>
        )}

        {/* Signup Button */}
        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

        {/* Login Link */}
        <div className="login-link">
          Already have an account?

          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </div>

      </div>

    </div>
  );
}

export default Signup;