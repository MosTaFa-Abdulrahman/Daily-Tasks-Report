import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../requestMethod";

export const employeeSlice = createApi({
  reducerPath: "employeeApi",
  baseQuery: axiosBaseQuery({ baseUrl: "/employees" }),
  tagTypes: ["Employee"],

  endpoints: (builder) => ({
    // Get all Employees
    getEmployees: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["Employee"],
    }),

    // Get single Employee by ID
    getEmployeeById: builder.query({
      query: (employeeId) => ({
        url: `/${employeeId}`,
        method: "GET",
      }),
      providesTags: (result, error, employeeId) => [
        { type: "Employee", id: employeeId },
      ],
    }),

    // Create new Employee
    createEmployee: builder.mutation({
      query: (employeeData) => ({
        url: "/",
        method: "POST",
        data: employeeData,
      }),
      invalidatesTags: ["Employee"],
    }),

    // Update Employee
    updateEmployee: builder.mutation({
      query: ({ employeeId, ...employeeData }) => ({
        url: `/${employeeId}`,
        method: "PUT",
        data: employeeData,
      }),
      invalidatesTags: (result, error, { employeeId }) => [
        { type: "Employee", id: employeeId },
        "Employee",
      ],
    }),

    // Delete Employee
    deleteEmployee: builder.mutation({
      query: (employeeId) => ({
        url: `/${employeeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeSlice;
