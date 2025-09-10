import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, User } from "lucide-react";

// Components
import Modal from "../global/Modal";
import Spinner from "../global/Spinner";

// RTKQ & Validation
import { useCreateTaskMutation } from "../../store/tasks/taskSlice";
import { useGetEmployeesQuery } from "../../store/employees/employeeSlice";
import { validateTask } from "../../utils/validation";
import toast from "react-hot-toast";

export default function CreateModal({ isOpen, onClose }) {
  // State
  const [formData, setFormData] = useState({
    employeeId: "",
    description: "",
    from: "",
    to: "",
  });
  const [errors, setErrors] = useState({});

  // RTKQ
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const { data: employees = [], isLoading: employeesLoading } =
    useGetEmployeesQuery();

  useEffect(() => {
    if (isOpen) {
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
  };

  // Auto-set end time when start time changes
  const handleFromTimeChange = (e) => {
    const fromTime = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, from: fromTime };

      // Auto-set end time to 1 hour later if not already set
      if (fromTime && !prev.to) {
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

    // Validate form data
    const validation = validateTask(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await createTask(formData).unwrap();
      onClose();
      toast.success("Task Created Success 🚀");
    } catch (error) {
      if (error.data?.error) {
        if (error.data.error.includes("Total daily tasks")) {
          setErrors({
            general: error.data.error,
            currentHours: error.data.currentHours,
            remainingHours: error.data.remainingHours,
          });
        } else {
          setErrors({ general: error.data.error });
        }
      } else {
        setErrors({ general: "Failed to create task. Please try again." });
        toast.error("Failed to create task. Please try again.");
      }
    }
  };

  // Generate datetime-local input value
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errors.general}</p>
            {errors.currentHours !== undefined && (
              <div className="mt-2 text-sm text-red-700">
                <p>Current hours worked: {errors.currentHours}h</p>
                <p>Remaining hours available: {errors.remainingHours}h</p>
              </div>
            )}
          </div>
        )}

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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employeeId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isCreating}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isCreating}
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
              min={getMinDateTime()}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.from ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isCreating}
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.to ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isCreating}
            />
            {errors.to && (
              <p className="text-red-500 text-sm mt-1">{errors.to}</p>
            )}
          </div>
        </div>

        {/* Duration Display */}
        {formData.from && formData.to && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Calendar size={16} />
              <span className="font-medium">Task Duration</span>
            </div>
            <p className="text-blue-700 mt-1">
              {(() => {
                const from = new Date(formData.from);
                const to = new Date(formData.to);
                const duration = (to - from) / (1000 * 60 * 60);
                return duration > 0
                  ? `${duration.toFixed(2)} hours`
                  : "Invalid time range";
              })()}
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Spinner size={16} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Task
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
