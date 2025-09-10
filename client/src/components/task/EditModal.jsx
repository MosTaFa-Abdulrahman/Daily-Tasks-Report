import { useState, useEffect } from "react";
import { Edit2, Calendar, Clock, User } from "lucide-react";

// Components
import Modal from "../global/Modal";
import Spinner from "../global/Spinner";

// RTKQ & Validation
import { useUpdateTaskMutation } from "../../store/tasks/taskSlice";
import { useGetEmployeesQuery } from "../../store/employees/employeeSlice";
import { validateTask } from "../../utils/validation";
import toast from "react-hot-toast";

export default function EditModal({ isOpen, onClose, task }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    description: "",
    from: "",
    to: "",
  });
  const [errors, setErrors] = useState({});

  // RTKQ
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const { data: employees = [], isLoading: employeesLoading } =
    useGetEmployeesQuery();

  // Populate form when task changes
  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        employeeId: task.employeeId._id,
        description: task.description,
        from: new Date(task.from).toISOString().slice(0, 16),
        to: new Date(task.to).toISOString().slice(0, 16),
      });
      setErrors({});
    }
  }, [task, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employeeId: "",
        description: "",
        from: "",
        to: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error when any field changes
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  // Handle from time change with auto-population
  const handleFromTimeChange = (e) => {
    const fromTime = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, from: fromTime };

      // If to time is before new from time, adjust it
      if (fromTime && prev.to && new Date(fromTime) >= new Date(prev.to)) {
        const fromDate = new Date(fromTime);
        const toDate = new Date(fromDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        newData.to = toDate.toISOString().slice(0, 16);
      }

      return newData;
    });

    // Clear from error
    if (errors.from) {
      setErrors((prev) => ({
        ...prev,
        from: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task) return;

    // Validate form data
    const validation = validateTask(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await updateTask({
        taskId: task._id,
        ...formData,
      }).unwrap();

      onClose();
      toast.success("Task Created Success 🤞");
    } catch (error) {
      // Handle API errors
      if (error.data?.error) {
        if (error.data.error.includes("Total daily tasks")) {
          setErrors({
            general: error.data.error,
            currentHours: error.data.currentHours,
            remainingHours: error.data.remainingHours,
          });
        } else if (error.data.error.includes("conflicts")) {
          setErrors({
            general: error.data.error,
            conflictingTask: error.data.conflictingTask,
          });
        } else {
          setErrors({ general: error.data.error });
        }
      } else {
        setErrors({ general: "Failed to update task. Please try again." });
        toast.error("Failed to update task. Please try again.");
      }
    }
  };

  // Generate datetime-local input value
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Calculate duration for display
  const calculateDuration = () => {
    if (formData.from && formData.to) {
      const from = new Date(formData.from);
      const to = new Date(formData.to);
      const duration = (to - from) / (1000 * 60 * 60);
      return duration > 0 ? duration.toFixed(2) : "0";
    }
    return "0";
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!task) return false;

    const originalFrom = new Date(task.from).toISOString().slice(0, 16);
    const originalTo = new Date(task.to).toISOString().slice(0, 16);

    return (
      formData.employeeId !== task.employeeId._id ||
      formData.description !== task.description ||
      formData.from !== originalFrom ||
      formData.to !== originalTo
    );
  };

  if (!task) return null;

  const originalDateTime = {
    from: formatDateTime(task.from),
    to: formatDateTime(task.to),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">{errors.general}</p>
            {errors.currentHours !== undefined && (
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Current hours worked:{" "}
                  <span className="font-medium">{errors.currentHours}h</span>
                </p>
                <p>
                  Remaining hours available:{" "}
                  <span className="font-medium">{errors.remainingHours}h</span>
                </p>
              </div>
            )}
            {errors.conflictingTask && (
              <div className="mt-2 text-sm text-red-700">
                <p className="font-medium">Conflicting with:</p>
                <p>"{errors.conflictingTask.description}"</p>
                <p>
                  {formatDateTime(errors.conflictingTask.from).time} -{" "}
                  {formatDateTime(errors.conflictingTask.to).time}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Task Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Original Task Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Employee:</span>
              <p className="font-medium text-gray-900">
                {task.employeeId.name}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="font-medium text-gray-900">{task.duration}h</p>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <p className="font-medium text-gray-900">
                {originalDateTime.from.date}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <p className="font-medium text-gray-900">
                {originalDateTime.from.time} - {originalDateTime.to.time}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User size={16} />
            Employee *
          </label>
          {employeesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} text="Loading employees..." />
            </div>
          ) : (
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.employeeId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isUpdating}
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.email}
                </option>
              ))}
            </select>
          )}
          {errors.employeeId && (
            <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
          )}
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description..."
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isUpdating}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} />
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="from"
              value={formData.from}
              onChange={handleFromTimeChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.from ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isUpdating}
            />
            {errors.from && (
              <p className="text-red-500 text-sm mt-1">{errors.from}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} />
              End Time *
            </label>
            <input
              type="datetime-local"
              name="to"
              value={formData.to}
              onChange={handleChange}
              min={formData.from || getMinDateTime()}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.to ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isUpdating}
            />
            {errors.to && (
              <p className="text-red-500 text-sm mt-1">{errors.to}</p>
            )}
          </div>
        </div>

        {/* Duration Comparison */}
        {formData.from && formData.to && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 mb-3">
              <Calendar size={16} />
              <span className="font-medium">Duration Comparison</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-blue-700 font-medium">New Duration:</span>
                <p className="text-blue-600 text-lg font-semibold">
                  {calculateDuration()} hours
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-blue-700 font-medium">
                  Original Duration:
                </span>
                <p className="text-blue-600 text-lg font-semibold">
                  {task.duration} hours
                </p>
              </div>
            </div>
            {parseFloat(calculateDuration()) !== task.duration && (
              <div className="mt-2 text-xs text-blue-700">
                <span className="font-medium">Change: </span>
                {parseFloat(calculateDuration()) > task.duration ? "+" : ""}
                {(parseFloat(calculateDuration()) - task.duration).toFixed(
                  2
                )}{" "}
                hours
              </div>
            )}
          </div>
        )}

        {/* Change Indicator */}
        {hasChanges() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-orange-800 text-sm font-medium">
              ⚠️ You have unsaved changes
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating || !hasChanges()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <Spinner size={16} />
                Updating...
              </>
            ) : (
              <>
                <Edit2 size={16} />
                Update Task
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
