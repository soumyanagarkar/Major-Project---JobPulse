const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendResetPasswordEmail = async (email, resetLink) => {
  const mailOptions = {
    from: `"JobPulse AI" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "JobPulse AI - Reset Your Password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        background: #0f172a;
        color: white;
        border-radius: 15px;
      ">

        <h1 style="color:#38bdf8;">
          JobPulse AI
        </h1>

        <h2>Reset Your Password</h2>

        <p>
          We received a request to reset your JobPulse AI password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:14px 25px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:8px;
            margin:20px 0;
          "
        >
          Reset Password
        </a>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore
          this email.
        </p>

        <hr>

        <p style="color:#94a3b8;">
          © 2026 JobPulse AI
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendResetPasswordEmail,
};