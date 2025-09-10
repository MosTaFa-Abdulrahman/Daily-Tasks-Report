import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [activeLink, setActiveLink] = useState("");

  return (
    <nav className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">⚡</span>
              </div>
              <span className="text-white font-semibold text-xl">WorkFlow</span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
            {[
              { id: "employees", label: "employees", path: "/employees" },
              { id: "tasks", label: "tasks", path: "/tasks" },
            ].map((item) => (
              <NavLink to={`/${item.label}`}>
                <button
                  key={item.id}
                  onClick={() => setActiveLink(item.id)}
                  className={`relative px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeLink === item.id
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}

                  {/* Active glow effect */}
                  {activeLink === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-50 -z-10 animate-pulse"></div>
                  )}
                </button>
              </NavLink>
            ))}
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 group">
              <span className="text-white">🔔</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                3 notifications
              </div>
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-110">
              <span className="text-white font-bold text-sm">JS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
    </nav>
  );
}
