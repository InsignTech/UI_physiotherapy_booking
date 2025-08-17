import { AddAppointmentForm } from "./AddAppoinment";
import { Pagination } from "./Pagination";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  User,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getPatientAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getPatientByID,
} from "../services/patientApi";

// Helper function to format dates for the API (YYYY-MM-DD)
const toApiDateString = (date) => {
  return date.toISOString().split("T")[0];
};

export const AppointmentManagement = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPatient = location.state?.selectedPatient || null;
  const [latestPatient, setLatestPatient] = useState(
    location.state?.selectedPatient || null
  );

  const refreshPatient = () => {
    if (!selectedPatient?._id) return;
    getPatientByID(selectedPatient?._id)
      .then((res) => {
        setLatestPatient(res.data);
      })
      .catch((error) => {
        console.error("Error fetching patient details:", error);
        toast.error("Failed to fetch patient details");
      });
  };

  useEffect(() => {
    console.log(location.state?.selectedPatient);
    setLatestPatient(location.state?.selectedPatient || null);
    refreshPatient();
  }, [location.state?.selectedPatient]);

  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const itemsPerPage = 10;

  const now = new Date();
  let startDate = "";
  let endDate = "";
  // Handler for filter changes
  const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // State for new date filters
  const [activeFilter, setActiveFilter] = useState("today");
  const [dateRange, setDateRange] = useState({
    start: toLocalDateString(now),
    end: "",
  });

  const fetchAppointments = useCallback(async () => {
    try {
      // Updated API call with startDate and endDate
      const res = await getPatientAppointments(
        selectedPatient?._id || "",
        currentPage,
        itemsPerPage,
        dateRange.start,
        dateRange.end
      );
      setAppointments(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
      setAppointments([]);
      setTotalPages(1);
    }
  }, [selectedPatient, currentPage, itemsPerPage, dateRange]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);

    switch (filter) {
      case "today":
      default:
        startDate = toLocalDateString(now);
        endDate = ""; // no end date for today
        break;
      case "this_week": {
        const firstDayOfWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay()
        );
        const lastDayOfWeek = new Date(
          firstDayOfWeek.getFullYear(),
          firstDayOfWeek.getMonth(),
          firstDayOfWeek.getDate() + 6
        );
        startDate = toLocalDateString(firstDayOfWeek);
        endDate = toLocalDateString(lastDayOfWeek);
        break;
      }
      case "this_month": {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );
        startDate = toLocalDateString(firstDayOfMonth);
        endDate = toLocalDateString(lastDayOfMonth);
        break;
      }
      case "all":
        startDate = "";
        endDate = "";
        break;
    }

    setDateRange({ start: startDate, end: endDate });
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment._id, appointmentData);
        toast.success("Appointment updated successfully");
      } else {
        let res = await addAppointment(appointmentData);
        toast.success("Appointment added successfully");
      }

      setShowAddForm(false);
      setEditingAppointment(null);

      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      refreshPatient();
      fetchAppointments();
    } catch (error) {
      toast.error(
        editingAppointment
          ? "Failed to update appointment"
          : "Failed to add appointment"
      );
      console.error("Error with appointment:", error);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowAddForm(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await deleteAppointment(appointmentId);
      toast.success("Appointment deleted successfully");
      setDeleteConfirmId(null);
      fetchAppointments();
      refreshPatient();
    } catch (error) {
      toast.error("Failed to delete appointment");
      console.error("Error deleting appointment:", error);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getBalanceColor = (totalAmount, paidAmount) => {
    const balance = totalAmount - paidAmount;
    if (balance === 0) return "text-green-600";
    return "text-orange-600";
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          {selectedPatient && (
            <button
              onClick={() => navigate("/patients")}
              className="text-blue-600 hover:text-blue-800 p-1 sm:p-0 mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
              {selectedPatient
                ? `${selectedPatient.name}'s Appointments`
                : "All Appointments"}
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage patient appointments
              {selectedPatient && (
                <>
                  {" - Pending Balance: "}
                  <span
                    className={
                      latestPatient?.previousBalance === 0
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {latestPatient?.previousBalance ?? 0}₹
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/patients")}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            Patients
          </button>

          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingAppointment(null);
            }}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Appointment
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddAppointmentForm
          onSubmit={handleAddAppointment}
          onCancel={() => {
            setShowAddForm(false);
            setEditingAppointment(null);
          }}
          selectedPatient={latestPatient}
          initialData={editingAppointment}
          isEdit={!!editingAppointment}
        />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete this appointment? This action
              cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => handleDeleteAppointment(deleteConfirmId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base order-2 sm:order-1"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base order-1 sm:order-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            {["all", "today", "this_week", "this_month"].map((filter) => (
              // Styling updated for smaller filter buttons
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Patient
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Total Amount
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Paid Amount
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Balance
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Notes
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {appointment.patientId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(appointment.appointmentDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ₹{appointment.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      ₹{appointment.paidAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${getBalanceColor(
                          appointment.previousBalance,
                          appointment.totalAmount,
                          appointment.paidAmount
                        )}`}
                      >
                        ₹{appointment.previousBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {appointment.notes || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Appointment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(appointment._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No appointments found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden">
          {appointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 truncate">
                            {appointment.patientId?.name || "Unknown"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(appointment.appointmentDate)}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg"
                          title="Edit Appointment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(appointment._id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Total Amount
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{appointment.totalAmount}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Paid Amount
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ₹{appointment.paidAmount}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Balance
                        </div>
                        <div
                          className={`text-sm font-medium ${getBalanceColor(
                            appointment.previousBalance,
                            appointment.totalAmount,
                            appointment.paidAmount
                          )}`}
                        >
                          ₹{appointment.previousBalance}
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Notes
                          </div>
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {appointment.notes}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.totalAmount === appointment.paidAmount
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {appointment.totalAmount === appointment.paidAmount
                          ? "Fully Paid"
                          : "Pending Payment"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              No appointments found for the selected filter.
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
