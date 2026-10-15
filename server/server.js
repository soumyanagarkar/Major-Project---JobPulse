const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


/* ============================================================
   ENVIRONMENT
============================================================ */

dotenv.config({
  // Prefer server-specific settings, but also support the repository-root
  // .env used by this project when server/.env is absent.
  path: require("fs").existsSync(path.resolve(__dirname, ".env"))
    ? path.resolve(__dirname, ".env")
    : path.resolve(__dirname, "..", ".env"),
});

/* ============================================================
   EXPRESS APP
============================================================ */

const app = express();


/* ============================================================
   ROUTES
============================================================ */

const authRoutes =
  require("./routes/authRoutes");

const resumeRoutes =
  require("./routes/resumeRoutes");

const profileRoutes =
  require("./routes/profileRoutes");

const profilePhotoRoutes =
  require("./routes/profilePhotoRoutes");

const jobRoutes =
  require("./routes/jobRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");

/* ============================================================
   DATABASE
============================================================ */

const connectDB =
  require("./config/db");


/* ============================================================
   CONNECT DATABASE
============================================================ */

connectDB();


/* ============================================================
   MIDDLEWARE
============================================================ */

app.use(
  cors()
);

app.use(
  express.json({
    limit:
      "5mb",
  })
);


/* ============================================================
   UPLOADS
============================================================ */

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


/* ============================================================
   HEALTH CHECK
============================================================ */

app.get(
  "/",
  (req, res) => {

    res.status(
      200
    ).json({

      success:
        true,

      message:
        "🚀 JobPulse AI Backend Running",

      architecture:
        "Cache-first job search",

    });
  }
);


/* ============================================================
   AUTH
============================================================ */

app.use(
  "/api/auth",
  authRoutes
);


/* ============================================================
   RESUME
============================================================ */

app.use(
  "/api/resume",
  resumeRoutes
);


/* ============================================================
   PROFILE
============================================================ */

app.use(
  "/api/profile",
  profileRoutes
);


/* ============================================================
   PROFILE PHOTO
============================================================ */

app.use(
  "/api/profile-photo",
  profilePhotoRoutes
);


/* ============================================================
   JOBS
============================================================ */

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);


/* ============================================================
   ERROR HANDLER
============================================================ */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Express error:",
      error
    );


    if (
      res.headersSent
    ) {
      return next(
        error
      );
    }


    return res.status(
      500
    ).json({

      success:
        false,

      message:
        "Internal server error",

      error:
        error.message,

    });
  }
);


/* ============================================================
   START SERVER
============================================================ */

const PORT =
  Number(
    process.env.PORT
  ) || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      "\n=============================================="
    );

    console.log(
      "🚀 JOBPULSE BACKEND"
    );

    console.log(
      "=============================================="
    );

    console.log(
      `Server: http://localhost:${PORT}`
    );

    console.log(
      "Search mode: MongoDB cache-first"
    );

    console.log(
      "Background scraper: Python JobSpy"
    );

    console.log(
      "Semantic ranking: Python SentenceTransformer"
    );

    console.log(
      "==============================================\n"
    );
  }
);



