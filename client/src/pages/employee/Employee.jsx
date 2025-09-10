import { useState } from "react";
import {
  User,
  Calendar,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Mail,
  Target,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

// Components
import Spinner from "../../components/global/Spinner";

// RTKQ
import { useGetEmployeeByIdQuery } from "../../store/employees/employeeSlice";
import { useGetDailySummaryQuery } from "../../store/tasks/taskSlice";

function Employee() {
  const { employeeId } = useParams();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // RTKQ
  const {
    data: employee,
    isLoading: employeeLoading,
    error: employeeError,
  } = useGetEmployeeByIdQuery(employeeId);

  const {
    data: dailySummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useGetDailySummaryQuery(
    { employeeId, date: selectedDate },
    { skip: !employeeId || !selectedDate }
  );

  // Handle date navigation
  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get today's date for comparison
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;
  const isPastDate = selectedDate < today;

  // Loading state
  if (employeeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={48} text="Loading employee..." />
      </div>
    );
  }

  // Error state
  if (employeeError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Employee Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The employee you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Employee Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {employee?.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail size={16} />
                <span>{employee?.email}</span>
              </div>
              {employee?.position && (
                <p className="text-sm text-gray-500 mt-1">
                  {employee.position}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Calendar size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Daily Summary
                </h2>
              </div>
              <p className="text-gray-600">{formatDate(selectedDate)}</p>
              {isToday && (
                <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Today
                </span>
              )}
            </div>

            <button
              onClick={() => navigateDate(1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Quick Date Selection */}
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={() => setSelectedDate(today)}
              disabled={isToday}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Today
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split("T")[0]);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Yesterday
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <Spinner size={48} text="Loading daily summary..." />
          </div>
        ) : summaryError ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600">
                No tasks found for {formatDate(selectedDate)}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailySummary?.totalHours || 0}h
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock size={24} className="text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((dailySummary?.totalHours || 0) / 8) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">of 8 hours</p>
                </div>
              </div>

              {/* Remaining Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailySummary?.remainingHours || 8}h
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target size={24} className="text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {(dailySummary?.remainingHours || 8) > 0
                    ? "Available for new tasks"
                    : "Daily limit reached"}
                </p>
              </div>

              {/* Task Count */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailySummary?.tasks?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity size={24} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {isPastDate ? "Completed" : "Scheduled"} tasks
                </p>
              </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tasks for {formatDate(selectedDate)}
                  </h3>
                </div>
              </div>

              {dailySummary?.tasks && dailySummary.tasks.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {dailySummary.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {task.description}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>
                                {formatTime(task.from)} - {formatTime(task.to)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target size={14} />
                              <span>{task.duration}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Tasks Scheduled
                  </h4>
                  <p className="text-gray-600">
                    No tasks found for {formatDate(selectedDate)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Employee;
