import { AddAppointmentForm } from "./AddAppoinment";
import { Pagination } from "./Pagination";
import { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  getPatientAppointments, 
  addAppointment, 
  updateAppointment, 
  deleteAppointment 
} from "../services/patientApi";

export const AppointmentManagement = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPatient = location.state?.selectedPatient || null;

  const [appointments, setAppointments] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const itemsPerPage = 10;

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await getPatientAppointments(
        selectedPatient?._id || "",
        currentPage,
        itemsPerPage,
        searchDate
      );

      setAppointments(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
      setAppointments([]);
      setTotalPages(1);
    }
  }, [selectedPatient, currentPage, itemsPerPage, searchDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAddAppointment = async (appointmentData) => {
    try {
      if (editingAppointment) {
        // Update existing appointment
        await updateAppointment(editingAppointment._id, appointmentData);
        toast.success("Appointment updated successfully");
      } else {
        // Add new appointment
        await addAppointment(appointmentData);
        toast.success("Appointment added successfully");
      }
      
      setShowAddForm(false);
      setEditingAppointment(null);
      
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      fetchAppointments();
    } catch (error) {
      toast.error(editingAppointment ? "Failed to update appointment" : "Failed to add appointment");
      console.error("Error with appointment:", error);
    }
  };

  // FIXED: Pass the full appointment object instead of just the ID
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment); // Pass the entire appointment object
    setShowAddForm(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await deleteAppointment(appointmentId);
      toast.success("Appointment deleted successfully");
      setDeleteConfirmId(null);
      fetchAppointments();
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {selectedPatient && (
            <button
              onClick={() => navigate("/patients")}
              className="text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedPatient
                ? `${selectedPatient.name}'s Appointments`
                : "All Appointments"}
            </h1>
            <p className="text-gray-600 mt-2">Manage patient appointments</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingAppointment(null);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Appointment
        </button>
      </div>

      {/* Add/Edit Appointment Form */}
      {showAddForm && (
        <AddAppointmentForm
          onSubmit={handleAddAppointment}
          onCancel={() => {
            setShowAddForm(false);
            setEditingAppointment(null);
          }}
          selectedPatient={selectedPatient}
          initialData={editingAppointment}
          isEdit={!!editingAppointment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteAppointment(deleteConfirmId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar and Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {searchDate && (
              <button
                onClick={() => setSearchDate("")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
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
                        className={`font-medium ${
                          appointment.totalAmount === appointment.paidAmount
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        ₹{appointment.totalAmount - appointment.paidAmount}
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
                    {searchDate
                      ? "No appointments found for the selected date."
                      : "No appointments found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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