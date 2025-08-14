import { useState, useEffect } from "react";
import { searchPatients } from "../services/patientApi"; // make sure path is correct

export const AddAppointmentForm = ({
  onSubmit,
  onCancel,
  selectedPatient,
  initialData = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    patientId: selectedPatient?._id || "",
    totalAmount: "",
    paidAmount: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    notes: "",
    pendingBalance: selectedPatient?.pendingBalance || "",
  });

  // Initialize searchTerm with selectedPatient name if available
  const [searchTerm, setSearchTerm] = useState(selectedPatient?.name || "");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Populate form with initial data when editing
  useEffect(() => {
    if (isEdit && initialData) {
      const appointmentDate = new Date(initialData.appointmentDate);
      const formattedDate = appointmentDate.toISOString().split("T")[0];

      setFormData({
        patientId: initialData.patientId?._id || initialData.patientId,
        totalAmount: initialData.totalAmount?.toString() || "", // Convert to string
        paidAmount: initialData.paidAmount?.toString() || "", // Convert to string
        appointmentDate: formattedDate,
        notes: initialData.notes || "",
        pendingBalance: initialData.patientPendingBalance || 0,
      });

      // Set the patient name for display
      if (initialData.patientId?.name) {
        setSearchTerm(initialData.patientId.name);
      }
    }
  }, [isEdit, initialData]);

  // Search patients when typing (only if no selectedPatient and not editing)
  useEffect(() => {
    // Don't search if a patient is already selected or if we're editing
    if (selectedPatient || isEdit) {
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
  }, [searchTerm, selectedPatient, isEdit]);

  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === '') {
      setFormData({ ...formData, totalAmount: '' });
      return;
    }
    
    // Allow valid numbers only
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 500000) {
      setFormData({ ...formData, totalAmount: value });
    }
  };

  const handlePaidAmountChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === '') {
      setFormData({ ...formData, paidAmount: '' });
      return;
    }
    
    // Allow valid numbers with decimal
    if (/^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 500000) {
        setFormData({ ...formData, paidAmount: value });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If editing, use the existing patient info
    if (isEdit && initialData) {
      onSubmit({
        ...formData,
        patientName: initialData.patientId?.name,
        patientId: initialData.patientId?._id || initialData.patientId,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        appointmentDate: new Date(formData.appointmentDate),
      });
      return;
    }

    // If selectedPatient exists, use it; otherwise find from search results
    const patient =
      selectedPatient ||
      searchResults.find((p) => p._id === formData.patientId);

    if (!patient) {
      alert("Please select a patient");
      return;
    }

    onSubmit({
      ...formData,
      patientName: patient.name,
      patientId: patient._id,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      appointmentDate: new Date(formData.appointmentDate),
    });
  };

  const handleSelectPatient = async (patient) => {
    setFormData({
      ...formData,
      patientId: patient._id,
      pendingBalance: patient.pendingBalance || 0,
    });
    setSearchTerm(patient.name);
    setShowDropdown(false);

    // Optional: Fetch complete patient details if balance is not included in search
    if (!patient.pendingBalance && !patient.patientPendingBalance) {
      try {
        const fullPatientData = await getPatientById(patient._id);
        setFormData((prev) => ({
          ...prev,
          pendingBalance:
            fullPatientData.pendingBalance ||
            fullPatientData.patientPendingBalance ||
            0,
        }));
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    }
  };

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Reset patientId if user is typing (and not selectedPatient and not editing)
    if (!selectedPatient && !isEdit) {
      setFormData({ ...formData, patientId: "" });
    }
  };

  // Determine if patient input should be readonly
  const isPatientReadonly = selectedPatient || isEdit;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEdit ? "Edit Appointment" : "Add New Appointment"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Patient Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchTermChange}
            placeholder={
              selectedPatient
                ? selectedPatient.name
                : isEdit
                ? searchTerm
                : "Type to search..."
            }
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isPatientReadonly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            required
            readOnly={isPatientReadonly}
          />

          {/* Show dropdown only if no selectedPatient, not editing, and there are search results */}
          {!selectedPatient &&
            !isEdit &&
            showDropdown &&
            searchResults.length > 0 && (
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

          {/* Show appropriate message */}
          {selectedPatient && (
            <p className="text-sm text-gray-500 mt-1">
              Patient selected: {selectedPatient.name}
            </p>
          )}
          {isEdit && !selectedPatient && (
            <p className="text-sm text-gray-500 mt-1">
              Patient cannot be changed when editing appointment
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

        {/* Total Amount - Fixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.totalAmount}
            onChange={handleTotalAmountChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="500000"
            step="0.01"
          />
        </div>

        {/* Paid Amount - Fixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Amount
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.paidAmount}
            onChange={handlePaidAmountChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="500000"
            step="0.01"
            required
          />
        </div>

        {/* Pending Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pending Balance
          </label>
          <input
            type="number"
            value={formData.pendingBalance}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-1">
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
            {isEdit ? "Update Appointment" : "Add Appointment"}
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