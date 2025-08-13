import { Calendar, Users, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Navigation = ({ currentView }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Users, path: "/dashboard" },
    { id: "patients", label: "Patients", icon: Users, path: "/patients" },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      path: "/appointments",
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        {/* Desktop layout - exactly as before but with responsive classes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Physio Portal</h1>
            </div>
            
            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop logout - hidden on mobile */}
          <button
            onClick={onLogout}
            className="hidden md:block text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
          >
            Logout
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    currentView === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <hr className="my-2 border-gray-200" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium text-left"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};