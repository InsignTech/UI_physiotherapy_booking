import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Navigation = ({ currentView }) => {
  const navigate = useNavigate();

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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Physio Portal</h1>
          </div>
          <div className="flex gap-1">
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
        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
