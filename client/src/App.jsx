import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Header
import Header from "./components/Header";
// Pages
import Home from "./pages/home/Home";
import Employees from "./pages/employee/Employees";
import Employee from "./pages/employee/Employee";
import Tasks from "./pages/task/Tasks";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          {/* Default route - redirect to employees */}
          <Route path="/" element={<Home />} />

          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:employeeId" element={<Employee />} />

          <Route path="/tasks" element={<Tasks />} />

          {/* Catch-all route for 404 */}
          <Route
            path="*"
            element={
              <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">
                  404 - Page Not Found
                </h1>
                <Link
                  to="/"
                  className="text-blue-500 hover:underline mt-4 inline-block"
                >
                  Go to Home
                </Link>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
