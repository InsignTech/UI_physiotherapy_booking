import { AddAppointmentForm } from "./AddAppoinment";
import { Pagination } from "./Pagination";
import { useState, useEffect } from "react";
import { Calendar, Plus, Eye, Filter } from "lucide-react";
import { toast } from "react-toastify";
export const AppointmentManagement = ({ selectedPatient, onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const itemsPerPage = 10;

  let filteredAppointments = selectedPatient
    ? appointments.filter((apt) => apt.patientId === selectedPatient._id)
    : appointments;

  if (searchDate) {
    const searchDateObj = new Date(searchDate);
    filteredAppointments = filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === searchDateObj.toDateString();
    });
  }

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAddAppointment = (appointmentData) => {
    const newAppointment = {
      ...appointmentData,
      _id: `appointment_${Date.now()}`,
      timestamp: new Date(),
    };
    setAppointments([newAppointment, ...appointments]);
    setShowAddForm(false);
  };

  const handleUpdatePatient = async (updatedPatientData) => {
    try {
      await updatePatient(editingPatient._id, updatedPatientData);
      setPatients(
        patients.map((p) =>
          p._id === editingPatient._id ? { ...p, ...updatedPatientData } : p
        )
      );
      setEditingPatient(null);

      toast.success("Patient updated successfully!");
    } catch (error) {
      toast.error("Failed to update patient.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {selectedPatient && (
            <button
              onClick={() => onNavigate("patients")}
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
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Appointment
        </button>
      </div>

      {showAddForm && (
        <AddAppointmentForm
          onSubmit={handleAddAppointment}
          onCancel={() => setShowAddForm(false)}
          patients={[]}
          selectedPatient={selectedPatient}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Calendar className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {appointment.patientName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
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
                    {appointment.notes}
                  </td>
                </tr>
              ))}
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
