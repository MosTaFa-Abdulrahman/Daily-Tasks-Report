const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    description: { type: String, required: true, trim: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    date: { type: String },
    duration: { type: Number },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate duration
TaskSchema.pre("save", function (next) {
  const fromTime = new Date(this.from);
  const toTime = new Date(this.to);

  // Calculate duration in hours
  this.duration = (toTime - fromTime) / (1000 * 60 * 60);

  // Set date from 'from' field
  this.date = fromTime.toISOString().split("T")[0];

  next();
});

module.exports = mongoose.model("Task", TaskSchema);
