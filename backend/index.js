const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./utils/db");
const userRoute = require("./routes/user.route");
const jobRoute = require("./routes/job.route");
const applicationRoute = require("./routes/application.route");
const aiRoute = require("./routes/ai.route");

const app = express();

// Parse all origins specified in environment variables and standard defaults
const envOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.ORIGIN,
]
  .filter(Boolean)
  .flatMap((url) => url.split(",").map((s) => s.trim()));

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, Postman, mobile apps) where origin is undefined
    if (!origin) {
      return callback(null, true);
    }

    // Match explicitly allowed origins or any localhost/127.0.0.1 development port
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

// 1. Enable CORS middleware at the top of the middleware stack
app.use(cors(corsOptions));

// 2. Standard body and cookie parsing
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/ai", aiRoute);

app.get("/", (req, res) => {
  res.json({
    message: "Job Portal API is running",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});