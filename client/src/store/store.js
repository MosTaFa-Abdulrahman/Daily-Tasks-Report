import { configureStore } from "@reduxjs/toolkit";

// Employees
import { employeeSlice } from "./employees/employeeSlice";
// Tasks
import { taskSlice } from "./tasks/taskSlice";

export const store = configureStore({
  reducer: {
    [employeeSlice.reducerPath]: employeeSlice.reducer,
    [taskSlice.reducerPath]: taskSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(employeeSlice.middleware)
      .concat(taskSlice.middleware),
});
