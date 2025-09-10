const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Routes
const employeeRoute = require("./routes/employee.route");
const taskRoute = require("./routes/task.route");

// Express Usages
dotenv.config();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ["http://localhost:5173", "https://daily-tasks-react-one.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
};
app.use(cors(corsOptions));

// Database Config
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully! 🎉");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

// MiddleWares
app.use("/api/employees", employeeRoute);
app.use("/api/tasks", taskRoute);

// Route Not-Found
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT} 🥰`));
