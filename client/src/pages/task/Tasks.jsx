import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  User,
  Clock,
  Calendar,
  Search,
  Filter,
} from "lucide-react";

// Components
import CreateModal from "../../components/task/CreateModal";
import EditModal from "../../components/task/EditModal";
import DeleteModal from "../../components/global/DeleteModal";
import Spinner from "../../components/global/Spinner";

// RTKQ
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
} from "../../store/tasks/taskSlice";

function Tasks() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  // RTK Query hooks
  const { data: tasks = [], isLoading, error, refetch } = useGetTasksQuery();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // Filter tasks based on search and employee filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEmployee = filterEmployee
      ? task.employeeId.name
          .toLowerCase()
          .includes(filterEmployee.toLowerCase())
      : true;
    return matchesSearch && matchesEmployee;
  });

  // Get unique employees for filter dropdown
  const uniqueEmployees = [
    ...new Map(
      tasks.map((task) => [task.employeeId._id, task.employeeId])
    ).values(),
  ];

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // Handle delete task
  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (selectedTask) {
      try {
        await deleteTask(selectedTask._id).unwrap();
        setIsDeleteModalOpen(false);
        setSelectedTask(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedTask(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={48} text="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">
            Failed to load tasks. Please try again.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage and track all employee tasks</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Employee Filter */}
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
            >
              <option value="">All Employees</option>
              {uniqueEmployees.map((employee) => (
                <option key={employee._id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || filterEmployee) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterEmployee("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterEmployee
              ? "No tasks match your current filters."
              : "Get started by creating your first task."}
          </p>
          {!searchTerm && !filterEmployee && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => {
            const fromDateTime = formatDateTime(task.from);
            const toDateTime = formatDateTime(task.to);

            return (
              <div
                key={task._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Task Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {task.description}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User size={14} />
                      <span>{task.employeeId.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{fromDateTime.date}</span>
                  </div>

                  {/* Time Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>
                      {fromDateTime.time} - {toDateTime.time}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Duration:
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {task.duration}h
                    </span>
                  </div>
                </div>

                {/* Employee Email */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {task.employeeId.email}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          handleModalClose();
        }}
      />

      <EditModal
        isOpen={isEditModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsEditModalOpen(false);
          handleModalClose();
        }}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.description}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}

export default Tasks;
