import { useState, useEffect } from "react";
import { searchPatients, getPatientByID } from "../services/patientApi";
import { toast } from "react-toastify";

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
  });

  // ✅ fix: initialize with 0 instead of "second"
  const [balance, setBalance] = useState(0);

  // ✅ fetch patient balance directly
  const fetchPatientBalance = async (patientId) => {
    try {
      const patientData = await getPatientByID(patientId);
      const bal = patientData.data.previousBalance || 0;
      console.log("Fetched patient balance:", bal);
      setBalance(bal);
      return bal;
    } catch (error) {
      console.error("Error fetching patient balance:", error);
      setBalance(0);
      return 0;
    }
  };

  // Populate form with initial data when editing
  useEffect(() => {
    if (isEdit && initialData) {
      const appointmentDate = new Date(initialData.appointmentDate);
      const formattedDate = appointmentDate.toISOString().split("T")[0];

      const loadPatientData = async () => {
        const bal = await fetchPatientBalance(
          initialData.patientId?._id || initialData.patientId
        );

        setFormData({
          patientId: initialData.patientId?._id || initialData.patientId,
          totalAmount: initialData.totalAmount?.toString() || "",
          paidAmount: initialData.paidAmount?.toString() || "",
          appointmentDate: formattedDate,
          notes: initialData.notes || "",
        });

        if (initialData.patientId?.name) {
          setSearchTerm(initialData.patientId.name);
        }

        // ✅ keep balance in its own state
        setBalance(bal);
      };

      loadPatientData();
    }
  }, [isEdit, initialData]);

  // Initialize searchTerm with selectedPatient name if available
  const [searchTerm, setSearchTerm] = useState(selectedPatient?.name || "");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [paidAmountError, setPaidAmountError] = useState("");

  // Search patients when typing (only if no selectedPatient and not editing)
  useEffect(() => {
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

  // Fetch balance if selectedPatient is already passed (Add Appointment without search)
useEffect(() => {
  if (selectedPatient && !isEdit) {
    const loadBalance = async () => {
      const bal = await fetchPatientBalance(selectedPatient._id);
      setBalance(bal);
    };
    loadBalance();
  }
}, [selectedPatient, isEdit]);


  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setFormData({ ...formData, totalAmount: "" });
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 500000) {
      setFormData({ ...formData, totalAmount: value });
    }
  };

  const handlePaidAmountChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setFormData({ ...formData, paidAmount: "" });
      return;
    }
    if (/^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 500000) {
        setFormData({ ...formData, paidAmount: value });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paidAmountError) {
      toast.error(paidAmountError);
      return;
    }

    if (isEdit && initialData) {
      onSubmit({
        ...formData,
        patientName: initialData.patientId?.name,
        patientId: initialData.patientId?._id || initialData.patientId,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        appointmentDate: new Date(formData.appointmentDate),
        previousBalance: balance, // ✅ use balance here
      });
      return;
    }

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
      previousBalance: balance, // ✅ also pass in add mode
    });
  };

  const handleSelectPatient = async (patient) => {
    setFormData({
      ...formData,
      patientId: patient._id,
    });
    setSearchTerm(patient.name);
    setShowDropdown(false);
    setBalance(patient.previousBalance || 0);
  };

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!selectedPatient && !isEdit) {
      setFormData({ ...formData, patientId: "" });
    }
  };

  // Validation
  useEffect(() => {
    const total = parseFloat(formData.totalAmount) || 0;
    const paid = parseFloat(formData.paidAmount) || 0;
    const pending = parseFloat(balance) || 0;

    const maxAllowedPayment = total + pending;

    if (paid > maxAllowedPayment) {
      setPaidAmountError(
        `Paid amount cannot exceed the total due of ${maxAllowedPayment}`
      );
    } else {
      setPaidAmountError("");
    }
  }, [formData.paidAmount, formData.totalAmount, balance]);

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
        {/* Patient Input */}
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
                    <div className="font-medium">{patient.phoneNumber}</div>
                  </li>
                ))}
              </ul>
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
            placeholder="0"
            value={formData.totalAmount}
            onChange={handleTotalAmountChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="500000"
            step="0.01"
          />
        </div>

        {/* Paid Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Amount
          </label>
          <input
            type="number"
            placeholder="0"
            value={formData.paidAmount}
            onChange={handlePaidAmountChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 ${
              paidAmountError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            min="0"
            max="500000"
            step="0.01"
          />
          {paidAmountError && (
            <p className="text-sm text-red-600 mt-1">{paidAmountError}</p>
          )}
        </div>

        {/* Pending Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pending Balance
          </label>
          <input
            type="number"
            value={balance}
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
            placeholder="Add any additional notes..."
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
