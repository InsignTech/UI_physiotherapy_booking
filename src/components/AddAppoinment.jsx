import { useState, useEffect } from "react";
import { searchPatients } from "../services/patientApi"; // make sure path is correct


export const AddAppointmentForm = ({ onSubmit, onCancel, selectedPatient }) => {
  const [formData, setFormData] = useState({
    patientId: selectedPatient?._id || "",
    totalAmount: "",
    paidAmount: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Initialize searchTerm with selectedPatient name if available
  const [searchTerm, setSearchTerm] = useState(selectedPatient?.name || "");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search patients when typing (only if no selectedPatient)
  useEffect(() => {
    // Don't search if a patient is already selected
    if (selectedPatient) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await searchPatients(searchTerm);
        setSearchResults(res.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching patients:", error);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedPatient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If selectedPatient exists, use it; otherwise find from search results
    const patient = selectedPatient || searchResults.find((p) => p._id === formData.patientId);
    
    if (!patient) {
      alert("Please select a patient");
      return;
    }

    onSubmit({
      ...formData,
      patientName: patient.name,
      patientId: patient._id,
      totalAmount: parseInt(formData.totalAmount),
      paidAmount: parseInt(formData.paidAmount),
      appointmentDate: new Date(formData.appointmentDate),
    });
  };

  const handleSelectPatient = (patient) => {
    setFormData({ ...formData, patientId: patient._id });
    setSearchTerm(patient.name);
    setShowDropdown(false);
  };

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Reset patientId if user is typing (and not selectedPatient)
    if (!selectedPatient) {
      setFormData({ ...formData, patientId: "" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Appointment
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
            placeholder={selectedPatient ? selectedPatient.name : "Type to search..."}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              selectedPatient ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            required
            readOnly={selectedPatient}
          />
          
          {/* Show dropdown only if no selectedPatient and there are search results */}
          {!selectedPatient && showDropdown && searchResults.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-48 overflow-y-auto shadow-lg">
              {searchResults.map((patient) => (
                <li
                  key={patient._id}
                  onClick={() => handleSelectPatient(patient)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{patient.name}</div>
                </li>
              ))}
            </ul>
          )}
          
          {/* Show message if selectedPatient exists */}
          {selectedPatient && (
            <p className="text-sm text-gray-500 mt-1">
              Patient selected: {selectedPatient.name}
            </p>
          )}
        </div>

        {/* Appointment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Date
          </label>
          <input
            type="date"
            value={formData.appointmentDate}
            onChange={(e) =>
              setFormData({ ...formData, appointmentDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <input
            type="number"
            value={formData.totalAmount}
            onChange={(e) =>
              setFormData({ ...formData, totalAmount: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            min="0"
          />
        </div>

        {/* Paid Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Amount
          </label>
          <input
            type="number"
            value={formData.paidAmount}
            onChange={(e) =>
              setFormData({ ...formData, paidAmount: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            min="0"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Add any additional notes about the appointment..."
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Appointment
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
