import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  X,
  Plus,
} from "lucide-react";
import { getPatientAppointments } from "../services/patientApi"; // Ensure this path is correct

/**
 * Calculates a person's age from their date of birth string.
 * @param {string} dobString - The date of birth string (e.g., "YYYY-MM-DD").
 * @returns {number|null} The calculated age or null if the DOB is invalid.
 */
const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : null;
};

export const AppointmentCalendarMonitor = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingMoreDetails, setViewingMoreDetails] = useState(null);

  const fetchAppointments = useCallback(async () => {
  setLoading(true);
  try {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const formatDateLocal = (date) =>
      date.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const startDateForAPI = formatDateLocal(startDate);
    const endDateForAPI = formatDateLocal(endDate);

    console.log("Fetching:", startDateForAPI, "to", endDateForAPI);

    const res = await getPatientAppointments(
      "",
      1,
      500,
      startDateForAPI,
      endDateForAPI
    );

    setAppointments(res.data || []);
  } catch (error) {
    console.error("Failed to fetch appointments", error);
    setAppointments([]);
  } finally {
    setLoading(false);
  }
}, [currentDate]);


  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getAppointmentsForDate = (day) => {
    if (!day) return [];
    // ✅ Robustly filters appointments by comparing date parts directly
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handlePatientClick = (patient, appointment) => {
    if (!patient) {
      console.error(
        "Patient data is missing for this appointment:",
        appointment
      );
      return;
    }

    // ✅ Gracefully handles missing age by calculating it from DOB
    const patientAge =
      patient.age || calculateAge(patient.dob) || "Not specified";

    setSelectedPatient({
      ...patient,
      appointment,
      phone: patient.phoneNumber || "Not provided",
      email: patient.email || "Not provided",
      address: patient.address || "Not provided",
      age: patientAge,
      gender: patient.gender || "Not specified",
    });
    setShowModal(true);
  };

  const navigateMonth = (direction) => {
    setViewingMoreDetails(null);
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getPaymentStatus = (total, paid) => {
    const balance = total - paid;
    if (balance <= 0)
      return { status: "Fully Paid", color: "text-green-600 bg-green-100" };
    return { status: "Pending", color: "text-orange-600 bg-orange-100" };
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Statistics are now calculated only on the relevant month's data
  const totalRevenue = appointments.reduce(
    (sum, apt) => sum + apt.totalAmount,
    0
  );
  const totalPaid = appointments.reduce((sum, apt) => sum + apt.paidAmount, 0);
  const pendingAmount = totalRevenue - totalPaid;
  const fullyPaidCount = appointments.filter(
    (apt) => apt.totalAmount === apt.paidAmount
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="text-gray-500">Loading Calendar...</div>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-2 md:p-4 max-w-7xl mx-auto relative">
      {viewingMoreDetails && (
        <div className="absolute top-0 right-0 w-full sm:w-64 md:w-72 bg-white border border-gray-300 rounded-xl shadow-2xl z-20 mt-2 mr-2">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h4 className="font-bold text-gray-800 text-sm md:text-base">
              {`Appts for ${monthNames[currentDate.getMonth()]} ${
                viewingMoreDetails.day
              }`}
            </h4>
            <button
              onClick={() => setViewingMoreDetails(null)}
              className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {viewingMoreDetails.appointments.map((appointment) => {
              const paymentStatus = getPaymentStatus(
                appointment.totalAmount,
                appointment.paidAmount
              );
              return (
                <div
                  key={appointment._id}
                  onClick={() =>
                    handlePatientClick(appointment.patientId, appointment)
                  }
                  className="bg-blue-50 text-blue-800 p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <div className="font-bold truncate text-sm leading-tight">
                    {appointment.patientId?.name || "Unknown Patient"}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <DollarSign className="w-3 h-3" />
                    <span className="truncate">₹{appointment.totalAmount}</span>
                    <span
                      className={`ml-auto px-1.5 py-0.5 rounded text-xs font-semibold ${paymentStatus.color}`}
                    >
                      {paymentStatus.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200">
        {/* Calendar Header */}
        <div className="p-2 sm:p-4 md:p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Appointment Calendar
            </h1>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-base md:text-lg font-semibold text-gray-700 w-36 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-2 sm:p-4 md:p-5">
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-1 text-xs sm:text-sm"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              const maxVisible = window.innerWidth < 768 ? 1 : 2;
              const visibleAppointments = dayAppointments.slice(0, maxVisible);
              const hasMore = dayAppointments.length > maxVisible;
              const isToday =
                day &&
                new Date().toDateString() ===
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  ).toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[80px] md:min-h-[120px] border border-gray-200 rounded-lg p-2 flex flex-col ${
                    day ? "bg-white" : "bg-gray-50"
                  } ${isToday ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1 flex-grow">
                        {visibleAppointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            onClick={() =>
                              handlePatientClick(
                                appointment.patientId,
                                appointment
                              )
                            }
                            className="text-xs bg-blue-100 text-blue-800 px-1.5 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors border border-blue-200"
                          >
                            <div className="font-semibold truncate text-xs leading-tight">
                              {appointment.patientId?.name || "Unknown"}
                            </div>
                          </div>
                        ))}
                      </div>
                      {hasMore && (
                        <button
                          onClick={() =>
                            setViewingMoreDetails({
                              day,
                              appointments: dayAppointments,
                            })
                          }
                          className="w-full text-xs bg-gray-100 text-gray-600 py-1 mt-1 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {dayAppointments.length - maxVisible} more
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Footer */}
        <div className="p-2 sm:p-4 md:p-5 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Total</div>
              <div className="text-2xl font-bold text-blue-800">
                {appointments.length}
              </div>
              <div className="text-xs text-blue-600 mt-1">Appointments</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">
                Fully Paid
              </div>
              <div className="text-2xl font-bold text-green-800">
                {fullyPaidCount}
              </div>
              <div className="text-xs text-green-600 mt-1">
                ₹{totalPaid.toLocaleString()}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-orange-600 text-sm font-medium">Pending</div>
              <div className="text-2xl font-bold text-orange-800">
                {appointments.length - fullyPaidCount}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                ₹{pendingAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-indigo-600 text-sm font-medium">
                Total Revenue
              </div>
              <div className="text-2xl font-bold text-indigo-800">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-indigo-600 mt-1">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Patient Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-gray-900 font-medium text-base">
                      {selectedPatient.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Age & Gender
                    </label>
                    <p className="text-gray-900 text-base">
                      {selectedPatient.age} years, {selectedPatient.gender}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone
                      </label>
                      <p className="text-gray-900 text-base">
                        {selectedPatient.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-gray-900 text-base break-all">
                        {selectedPatient.email}
                      </p>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Address
                      </label>
                      <p className="text-gray-900 text-base">
                        {selectedPatient.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedPatient.appointment && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Appointment Details
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-blue-600">
                          Date
                        </label>
                        <div className="text-blue-900 font-medium flex items-center gap-2 text-base">
                          <Clock className="w-4 h-4" />
                          {formatDate(
                            selectedPatient.appointment.appointmentDate
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-600">
                          Total Amount
                        </label>
                        <p className="text-blue-900 font-medium text-base">
                          ₹{selectedPatient.appointment.totalAmount}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-600">
                          Paid Amount
                        </label>
                        <p className="text-green-600 font-medium text-base">
                          ₹{selectedPatient.appointment.paidAmount}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-600">
                          Balance
                        </label>
                        <p
                          className={`font-medium text-base ${
                            selectedPatient.appointment.totalAmount <=
                            selectedPatient.appointment.paidAmount
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          ₹
                          {selectedPatient.appointment.totalAmount -
                            selectedPatient.appointment.paidAmount}
                        </p>
                      </div>
                    </div>
                    {selectedPatient.appointment.notes && (
                      <div>
                        <label className="text-sm font-medium text-blue-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Notes
                        </label>
                        <p className="text-blue-900 mt-1 text-base">
                          {selectedPatient.appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
