import { useState } from "react";
import {
  Plus,
  User,
  Mail,
  Phone,
  Briefcase,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// Components
import CreateModal from "../../components/employee/CreateModal";
import EditModal from "../../components/employee/EditModal";
import DeleteModal from "../../components/global/DeleteModal";
import Spinner from "../../components/global/Spinner";

// RTKQ
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "../../store/employees/employeeSlice";

function Employees() {
  // States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // RTKQ
  const { data: employees = [], isLoading, error } = useGetEmployeesQuery();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(selectedEmployee._id).unwrap();
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);
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

  // Loading & Error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size={40} text="Loading employees..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">
            Error loading employees
          </div>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Employee Management
        </h1>
        <p className="text-gray-600">
          Manage your team members and their information
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <User className="text-blue-500" size={24} />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {employees.length}
              </h3>
              <p className="text-gray-600">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <Briefcase className="text-green-500" size={24} />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {
                  new Set(employees.map((emp) => emp.position).filter(Boolean))
                    .size
                }
              </h3>
              <p className="text-gray-600">Positions</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <Search className="text-purple-500" size={24} />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {filteredEmployees.length}
              </h3>
              <p className="text-gray-600">Search Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm ? "No employees found" : "No employees yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by adding your first employee"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add First Employee
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <NavLink to={`/employees/${employee._id}`}>
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Added {formatDate(employee.createdAt)}
                      </p>
                    </div>
                  </div>
                </NavLink>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(employee)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}
                {employee.position && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">{employee.position}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete "${selectedEmployee?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
      />

      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <Spinner size={40} text="Deleting employee..." />
        </div>
      )}
    </div>
  );
}

export default Employees;
