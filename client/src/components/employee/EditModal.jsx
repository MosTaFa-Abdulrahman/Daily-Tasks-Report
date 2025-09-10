import { useState, useEffect } from "react";
import { User, Mail, Phone, Briefcase } from "lucide-react";

// Components
import Modal from "../global/Modal";
import Spinner from "../global/Spinner";

// RTKQ & Validation
import { useUpdateEmployeeMutation } from "../../store/employees/employeeSlice";
import { validateEmployeeUpdate } from "../../utils/validation";
import toast from "react-hot-toast";

export default function EditModal({ isOpen, onClose, employee }) {
  // State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RTKQ
  const [updateEmployee] = useUpdateEmployeeMutation();

  // Populate form when employee changes
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
      });
      setErrors({});
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Create update data (only include fields that changed)
    const updateData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== (employee[key] || "")) {
        updateData[key] = formData[key];
      }
    });

    // If no changes were made
    if (Object.keys(updateData).length === 0) {
      onClose();
      setIsSubmitting(false);
      return;
    }

    // Validate form data using simple validation
    const validation = validateEmployeeUpdate(updateData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await updateEmployee({
        employeeId: employee._id,
        ...updateData,
      }).unwrap();
      toast.success("Üpdated Success 🎯");

      onClose();
    } catch (error) {
      // Handle API errors
      if (error?.data?.message) {
        setErrors({ submit: error.data.message });
        toast.error({ submit: error.data.message });
      } else {
        setErrors({ submit: "Failed to update employee. Please try again." });
        toast.error("Failed to update employee. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Custom title with last updated info
  const modalTitle = (
    <div>
      <div className="text-xl text-gray-900">Edit Employee</div>
      {employee && (
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {formatDate(employee.updatedAt)}
        </p>
      )}
    </div>
  );

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter employee's full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled={true}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            placeholder="Email cannot be changed"
          />
          <p className="text-gray-500 text-xs mt-1">
            Email address cannot be modified
          </p>
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
              errors.phone
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter phone number (optional)"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Position Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase size={16} className="inline mr-2" />
            Position
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
              errors.position
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter job position (optional)"
          />
          {errors.position && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.position}
            </p>
          )}
        </div>

        {/* Employee Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Employee Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="text-gray-900">{formatDate(employee.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Employee ID:</span>
              <p className="text-gray-900 font-mono">{employee._id}</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Spinner size={16} />
                Updating...
              </>
            ) : (
              "Update Employee"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
