import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { addPatient, updatePatient } from "../services/patientApi";

export const AddPatientForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    phoneNumber: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        age: initialData.age || "",
        gender: initialData.gender || "",
        address: initialData.address || "",
        phoneNumber: initialData.phoneNumber || "",
        email: initialData.email || "",
      });
    } else {
      // Reset form when switching to add mode
      setFormData({
        name: "",
        age: "",
        gender: "",
        address: "",
        phoneNumber: "",
        email: "",
      });
    }
    // Clear phone error when form data changes
    setPhoneError("");
  }, [initialData]);

  const validatePhoneNumber = (phone) => {
    // Remove any non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 0) {
      return "Phone number is required";
    }
    if (cleanPhone.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    
    setFormData({ ...formData, phoneNumber: cleanValue });
    
    // Validate phone number
    const error = validatePhoneNumber(cleanValue);
    setPhoneError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final phone number validation before submission
    const phoneValidationError = validatePhoneNumber(formData.phoneNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        phoneNumber: formData.phoneNumber,
      };

      let response;
      if (isEdit && initialData?._id) {
        response = await updatePatient(initialData._id, patientData);
        toast.success("Patient updated successfully!");
      } else {
        response = await addPatient(patientData);
        toast.success("Patient added successfully!");
      }

      onSubmit(response.data || patientData);

      if (!isEdit) {
        setFormData({
          name: "",
          age: "",
          gender: "",
          address: "",
          phoneNumber: "",
          email: "",
        });
        setPhoneError("");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${isEdit ? "update" : "add"} patient. Please try again.`
      );
      console.error("Error saving patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEdit ? "Edit Patient" : "Add New Patient"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            min={0}
            max={150}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              phoneError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter 10-digit phone number"
            maxLength={10}
            required
            disabled={isSubmitting}
          />
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {formData.phoneNumber.length}/10 digits
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || phoneError}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding Patient..."
              : isEdit
              ? "Save Changes"
              : "Add Patient"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};