import { AddPatientForm } from "./AddPatient";
import { Pagination } from "./Pagination";
import { useState, useEffect } from 'react';
import {   Eye , Plus, Search, X } from 'lucide-react';
// Patient Management Component

export const PatientManagement = ({ onNavigate, onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const itemsPerPage = 10;

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleAddPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      _id: `patient_${Date.now()}`,
    };
    setPatients([newPatient, ...patients]);
    setShowAddForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
          <p className="text-gray-600 mt-2">Manage your patients effectively</p>
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
            aria-label="Close" >
            <X className="w-5 h-5" />
            Close
          </button>
        )}
      </div>

      {showAddForm && (
        <AddPatientForm
          onSubmit={handleAddPatient}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search patients by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Age</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Gender</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{patient.name}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.age}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{patient.gender}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.phoneNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onSelectPatient(patient);
                          onNavigate('appointments');
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Appointments"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Edit Patient"
                      >
                        <Edit  />
                      </button>
                    </div>
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
