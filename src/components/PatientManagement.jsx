import { AddPatientForm } from "./AddPatient";
import { Pagination } from "./Pagination";
import { useState, useEffect, useCallback } from "react";
import { Edit, Plus, Search, X, Trash2, Phone, Mail, User, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllPatients,
  searchPatients,
  getPatientAppointments,
  deletePatient
} from "../services/patientApi";
import { useNavigate } from "react-router-dom";

export const PatientManagement = ({ onNavigate }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchTerm.trim()) {
        res = await searchPatients(searchTerm.trim(), currentPage, itemsPerPage);
      } else {
        res = await getAllPatients(currentPage, itemsPerPage);
      }
      setPatients(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalPatients(res.pagination?.totalPatients || 0);
    } catch (error) {
      toast.error("Failed to fetch patients.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [fetchPatients]);

  const handleViewAppointments = async (patient) => {
    setLoading(true);
    try {
      const res = await getPatientAppointments(patient._id, 1, 10);
      
      const appointments = res.data || res.appointments || [];
      const hasAppointments = Array.isArray(appointments) && appointments.length > 0;
      
      if (hasAppointments) {
        navigate("/appointments", { state: { selectedPatient: patient } });
      } else {
        toast.info(`${patient.name} has no appointments.`);
        navigate("/appointments");
      }
    } catch (error) {
      console.error("Error checking appointments:", error);
      toast.error("Could not check appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await deletePatient(patientId);
      toast.success("Patient deleted successfully");
      setDeleteConfirmId(null);
      fetchPatients();
    } catch (error) {
      toast.error("Failed to delete patient");
      console.error("Error deleting patient:", error);
    }
  };
  
  const handleAddPatient = () => {
    setShowAddForm(false);
    setEditingPatient(null);
    setCurrentPage(1);
    fetchPatients(1, itemsPerPage, searchTerm);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowAddForm(true);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Patient Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage your patients effectively ({totalPatients} total patients)
          </p>
        </div>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Patient
          </button>
        ) : (
          <button
            onClick={() => setShowAddForm(false)}
            className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            Close
          </button>
        )}
      </div>

      {showAddForm && (
        <AddPatientForm
          onSubmit={handleAddPatient}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPatient(null);
          }}
          initialData={editingPatient}
          isEdit={!!editingPatient}
        />
      )}

      {/* Delete Confirmation Modal - Responsive */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete this patient? This action cannot be undone and will also delete all associated appointments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => handleDeletePatient(deleteConfirmId)}
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
        {/* Search and Filter Section - Responsive */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search patients by name, or phone..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center gap-2 self-end">
              <label className="text-xs sm:text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600 text-sm sm:text-base">Loading patients...</div>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                      Age
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                      Gender
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                      Phone
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {patient.age}
                        </td>
                        <td className="px-6 py-4 text-gray-600 capitalize">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {patient.phoneNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {patient.email}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Edit Patient"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => setDeleteConfirmId(patient._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewAppointments(patient)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              title="View Appointments"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No patients found matching your search."
                          : "No patients found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Visible on mobile and tablet */}
            <div className="lg:hidden">
              {patients.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <div key={patient._id} className="p-4 sm:p-6">
                      <div className="flex flex-col gap-3">
                        {/* Patient Name and Age */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {patient.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {patient.age} years, {patient.gender}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg"
                              title="Edit Patient"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => setDeleteConfirmId(patient._id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${patient.phoneNumber}`} className="hover:text-blue-600">
                              {patient.phoneNumber}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${patient.email}`} className="hover:text-blue-600 truncate">
                              {patient.email}
                            </a>
                          </div>
                        </div>
                        
                        {/* View Appointments Button */}
                        <button
                          onClick={() => handleViewAppointments(patient)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm w-full mt-2"
                        >
                          <Calendar className="w-4 h-4" />
                          View Appointments
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  {searchTerm
                    ? "No patients found matching your search."
                    : "No patients found."}
                </div>
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalPatients}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};