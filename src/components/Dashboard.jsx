import { useState, useEffect } from "react";
import { Calendar, Users, Eye, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/patientApi"; // Make sure this import is correct

export const Dashboard = ({ appointments = [] }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
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
    return <div className="p-6 text-red-500">Failed to load dashboard stats.</div>;
  }

  // Today's appointments list (for the right panel)
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
              <Calendar className="w-5 h-5" />
              View Appointments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today's Appointments
          </h2>
          <div className="space-y-3">
            {todayAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {appointment.patientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{appointment.totalAmount}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No appointments today
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};