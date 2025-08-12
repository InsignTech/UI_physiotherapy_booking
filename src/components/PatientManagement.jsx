import { AddPatientForm } from "./AddPatient";
import { Pagination } from "./Pagination";
import { useState, useEffect } from "react";
import { Edit, Eye, Plus, Search, X } from "lucide-react";
import {
  getAllPatients,
  searchPatients,
  updatePatient,
} from "../services/patientApi";
import { useNavigate } from "react-router-dom";

export const PatientManagement = ({ onNavigate, onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
  const [editingPatient, setEditingPatient] = useState(null);

  const navigate = useNavigate();


   const fetchPatients = async (page = currentPage, limit = itemsPerPage, search = searchTerm) => {
    setLoading(true);
    try {
      let res;
      if (search.trim()) {
        res = await searchPatients(search.trim(), page, limit);
      } else {
        res = await getAllPatients(page, limit);
      }
      setPatients(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalPatients(res.pagination?.totalPatients || 0);
    } catch (error) {
      setPatients([]);
      setTotalPages(1);
      setTotalPatients(0);
    } finally {
      setLoading(false);
    }
  };

  
  // Fetch patients from API
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      fetchPatients();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleAddPatient = (patientData) => {
    setShowAddForm(false);
    setEditingPatient(null);
    setCurrentPage(1);
    fetchPatients(1, itemsPerPage, searchTerm); // Refresh first page
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
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Patient Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your patients effectively ({totalPatients} total patients)
          </p>
        </div>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        ) : (
          <button
            onClick={() => setShowAddForm(false)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search patients by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="text-gray-600">Loading patients...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
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
                              onClick={() => {
                                onSelectPatient(patient);
                                navigate("appointments");
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Appointments"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Edit Patient"
                            >
                              <Edit className="w-4 h-4" />{" "}
                              {/* Replace with Edit icon if you have one */}
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
