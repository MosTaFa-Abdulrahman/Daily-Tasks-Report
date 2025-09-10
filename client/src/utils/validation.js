const isRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
};

const isEmail = (value) => {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Invalid email address";
  }
  return null;
};

// Employee Create
export const validateEmployee = (data) => {
  const errors = {};

  // Name validation
  const nameError = isRequired(data.name, "Name");
  if (nameError) {
    errors.name = nameError;
  }

  // Email validation
  const emailRequiredError = isRequired(data.email, "Email");
  if (emailRequiredError) {
    errors.email = emailRequiredError;
  } else {
    const emailFormatError = isEmail(data.email);
    if (emailFormatError) {
      errors.email = emailFormatError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors,
  };
};

// Employee Update
export const validateEmployeeUpdate = (data) => {
  const errors = {};

  // Name validation (only if provided)
  if (data.name !== undefined) {
    const nameError = isRequired(data.name, "Name");
    if (nameError) {
      errors.name = nameError;
    }
  }

  if (data.email !== undefined) {
    const emailFormatError = isEmail(data.email);
    if (emailFormatError) {
      errors.email = emailFormatError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors,
  };
};

// Task Create & Update
export const validateTask = (data) => {
  const errors = {};

  // Employee ID validation
  const employeeIdError = isRequired(data.employeeId, "Employee");
  if (employeeIdError) {
    errors.employeeId = employeeIdError;
  }

  // Description validation
  const descriptionError = isRequired(data.description, "Description");
  if (descriptionError) {
    errors.description = descriptionError;
  }

  // From date validation
  if (!data.from) {
    errors.from = "Start time is required";
  }

  // To date validation
  if (!data.to) {
    errors.to = "End time is required";
  } else if (data.from && data.to) {
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);

    // Check if dates are valid
    if (isNaN(fromDate.getTime())) {
      errors.from = "Invalid start time format";
    }

    if (isNaN(toDate.getTime())) {
      errors.to = "Invalid end time format";
    }

    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      // Check if end time is after start time
      if (toDate <= fromDate) {
        errors.to = "End time must be after start time";
      }

      // Check if both dates are on the same day
      if (fromDate.toDateString() !== toDate.toDateString()) {
        errors.to = "Task start and end time must be on the same day";
      }

      // Check if duration is not more than 8 hours
      const duration = (toDate - fromDate) / (1000 * 60 * 60);
      if (duration > 8) {
        errors.to = "Task duration cannot exceed 8 hours";
      }

      // Check if duration is at least 15 minutes
      if (duration < 0.25) {
        errors.to = "Task duration must be at least 15 minutes";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors,
  };
};

// Task Time Validation (for checking overlaps - client side helper)
export const validateTaskTime = (tasks, newTask, excludeTaskId = null) => {
  const errors = {};

  if (!newTask.from || !newTask.to || !newTask.employeeId) {
    return { isValid: true, errors: {} };
  }

  const newFromTime = new Date(newTask.from);
  const newToTime = new Date(newTask.to);
  const newDate = newFromTime.toDateString();

  // Filter tasks for the same employee and date
  const sameDayTasks = tasks.filter((task) => {
    if (excludeTaskId && task._id === excludeTaskId) {
      return false; // Exclude current task when updating
    }

    const taskEmployeeId =
      typeof task.employeeId === "object"
        ? task.employeeId._id
        : task.employeeId;

    const taskDate = new Date(task.from).toDateString();

    return taskEmployeeId === newTask.employeeId && taskDate === newDate;
  });

  // Check for time overlaps
  for (const existingTask of sameDayTasks) {
    const existingFromTime = new Date(existingTask.from);
    const existingToTime = new Date(existingTask.to);

    // Check if times overlap
    if (newFromTime < existingToTime && newToTime > existingFromTime) {
      errors.to = `Task time overlaps with existing task: "${existingTask.description}"`;
      break;
    }
  }

  // Calculate total duration for the day
  let totalDuration = (newToTime - newFromTime) / (1000 * 60 * 60);

  sameDayTasks.forEach((task) => {
    totalDuration += task.duration || 0;
  });

  if (totalDuration > 8) {
    errors.to = `Total daily tasks cannot exceed 8 hours. Current total would be ${totalDuration.toFixed(
      2
    )} hours.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors,
  };
};

// Utility function to format validation errors for display
export const formatValidationError = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (error.details && Array.isArray(error.details)) {
    return error.details[0]?.message || "Validation error occurred";
  }

  if (error.message) {
    return error.message;
  }

  return "An error occurred";
};
