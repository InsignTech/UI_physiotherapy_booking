import { useState, useEffect } from "react";
import { Calendar, Users, Eye, Filter,PlusSquare,LogOut  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/patientApi"; // Make sure this import is correct

export const Dashboard = ({ appointments = [] }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        console.log("res.......", res);
        setStats(res);
      } catch (error) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="p-6 text-red-500">Failed to load dashboard stats.</div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  const statsList = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments,
      icon: Calendar,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue?.toLocaleString()}`,
      icon: Eye,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Amount",
      value: `₹${stats.pendingAmount?.toLocaleString()}`,
      icon: Filter,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your physiotherapy practice portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsList.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/patients")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Manage Patients
            </button>
            <button
              onClick={() => navigate("/appointments")}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
             <PlusSquare className="w-5 h-5" />
              View Appointments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/calendar")}
              className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
               <Calendar className="w-5 h-5" />
              Calender
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
             <LogOut className="w-5 h-5" />
              logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
