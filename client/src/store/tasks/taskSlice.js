import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const taskSlice = createApi({
  reducerPath: "tasksApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/tasks" }),
  tagTypes: ["Task"],

  endpoints: (builder) => ({
    // Get all Tasks
    getTasks: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),

    // Get single Task by ID
    getTaskById: builder.query({
      query: (taskId) => ({
        url: `/${taskId}`,
        method: "GET",
      }),
      providesTags: (result, error, taskId) => [{ type: "Task", id: taskId }],
    }),

    // Get tasks by employee ID
    getTasksByEmployee: builder.query({
      query: (employeeId) => ({
        url: `/employee/${employeeId}`,
        method: "GET",
      }),
      providesTags: (result, error, employeeId) => [
        { type: "Task", id: `employee-${employeeId}` },
      ],
    }),

    // Get daily summary for employee
    getDailySummary: builder.query({
      query: ({ employeeId, date }) => ({
        url: `/summary/${employeeId}/${date}`,
        method: "GET",
      }),
      providesTags: (result, error, { employeeId, date }) => [
        { type: "Task", id: `daily-${employeeId}-${date}` },
      ],
    }),

    // Create new Task
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/",
        method: "POST",
        data: taskData,
      }),
      invalidatesTags: ["Task"],
    }),

    // Update Task
    updateTask: builder.mutation({
      query: ({ taskId, ...taskData }) => ({
        url: `/${taskId}`,
        method: "PUT",
        data: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Task",
      ],
    }),

    // Delete Task
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetTasksByEmployeeQuery,
  useGetDailySummaryQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskSlice;
