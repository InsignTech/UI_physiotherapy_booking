import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Phone, Mail, MapPin, DollarSign, FileText, Clock, X, Plus } from 'lucide-react';
import { getPatientAppointments } from "../services/patientApi";

export const AppointmentCalendarMonitor = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingMoreDetails, setViewingMoreDetails] = useState(null); // State for the floating panel

    // Fetch appointments
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            // Get all appointments (empty patient ID to get all)
            const res = await getPatientAppointments(
                "", // empty patient ID for all appointments
                1, // page
                1000, // large limit to get all appointments
                "" // no date filter
            );
            
            setAppointments(res.data || []);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        
        return days;
    };

    const getAppointmentsForDate = (day) => {
        if (!day) return [];
        
        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            const aptDateString = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
            return aptDateString === dateString;
        });
    };

    const handlePatientClick = (patient, appointment) => {
        console.log("patients",patient)
        setSelectedPatient({ 
            ...patient, 
            appointment,
            phone: patient.phoneNumber || 'Not provided',
            email: patient.email || 'Not provided', 
            address: patient.address || 'Not provided',
            age: patient.age || 'Not specified',
            gender: patient.gender || 'Not specified',
            medicalHistory: patient.notes || 'No medical history available'
        });
        setShowModal(true);
    };

    const navigateMonth = (direction) => {
        setViewingMoreDetails(null); // Close side panel when navigating
        setCurrentDate(prev => {
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
        if (balance === 0) return { status: 'Fully Paid', color: 'text-green-600 bg-green-100' };
        return { status: 'Pending Payment', color: 'text-orange-600 bg-orange-100' };
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Calculate statistics
    const currentMonthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getMonth() === currentDate.getMonth() && 
               aptDate.getFullYear() === currentDate.getFullYear();
    });

    const totalRevenue = currentMonthAppointments.reduce((sum, apt) => sum + apt.totalAmount, 0);
    const totalPaid = currentMonthAppointments.reduce((sum, apt) => sum + apt.paidAmount, 0);
    const pendingAmount = totalRevenue - totalPaid;
    const fullyPaidCount = currentMonthAppointments.filter(apt => apt.totalAmount === apt.paidAmount).length;

    if (loading) {
        return (
            <div className="p-2 sm:p-4 max-w-full sm:max-w-5xl mx-auto">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-center">
                        <div className="text-gray-500 text-sm sm:text-base">Loading appointments...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 sm:p-2 md:p-4 max-w-full sm:max-w-5xl mx-auto relative">
            {viewingMoreDetails && (
                <div className="absolute top-0 right-0 w-full sm:w-64 md:w-72 bg-white border border-gray-300 rounded-xl shadow-2xl z-20 mt-2 mr-2">
                    <div className="flex justify-between items-center p-3 border-b border-gray-200">
                        <h4 className="font-bold text-gray-800 text-sm md:text-base">
                            {`Appts for ${monthNames[currentDate.getMonth()]} ${viewingMoreDetails.day}`}
                        </h4>
                        <button
                            onClick={() => setViewingMoreDetails(null)}
                            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                        {viewingMoreDetails.appointments.map(appointment => {
                            const paymentStatus = getPaymentStatus(appointment.totalAmount, appointment.paidAmount);
                            return (
                                <div
                                    key={appointment._id}
                                    onClick={() => handlePatientClick(appointment.patientId, appointment)}
                                    className="bg-blue-100 text-blue-800 p-2 rounded cursor-pointer hover:bg-blue-200 transition-colors border border-blue-200"
                                >
                                    <div className="font-bold truncate text-sm leading-tight">
                                        {appointment.patientId.name}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-xs">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="truncate">₹{appointment.totalAmount}</span>
                                        <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${paymentStatus.color}`}>
                                            {appointment.totalAmount === appointment.paidAmount ? 'Paid' : 'Due'}
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
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-1 sm:gap-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <span className="hidden md:inline">Appointment Calendar Monitor</span>
                            <span className="md:hidden">Calendar</span>
                        </h1>
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-1 sm:p-1.5 md:p-2 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
                            </button>
                            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 min-w-[100px] sm:min-w-[120px] md:min-w-[160px] text-center">
                                <span className="sm:hidden">{monthNames[currentDate.getMonth()].slice(0, 3)} {String(currentDate.getFullYear()).slice(2)}</span>
                                <span className="hidden sm:inline">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-1 sm:p-1.5 md:p-2 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-2 sm:p-4 md:p-5">
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2 md:mb-3">
                        {dayNames.map(day => (
                            <div key={day} className="text-center font-semibold text-gray-600 py-1 text-xs sm:text-sm">
                                <span className="hidden sm:inline">{day}</span>
                                <span className="sm:hidden">{day.slice(0, 1)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
                        {getDaysInMonth(currentDate).map((day, index) => {
                            const dayAppointments = getAppointmentsForDate(day);
                            const maxVisible = window.innerWidth < 640 ? 1 : 2;
                            const visibleAppointments = dayAppointments.slice(0, maxVisible);
                            const hasMore = dayAppointments.length > maxVisible;
                            
                            const isToday = day && 
                                new Date().getDate() === day && 
                                new Date().getMonth() === currentDate.getMonth() && 
                                new Date().getFullYear() === currentDate.getFullYear();

                            return (
                                <div
                                    key={index}
                                    className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border border-gray-200 rounded-md sm:rounded-lg p-0.5 sm:p-1 md:p-2 flex flex-col ${
                                        day ? 'bg-white' : 'bg-gray-50'
                                    } ${isToday ? 'ring-1 sm:ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-xs sm:text-sm font-medium mb-1 ${
                                                isToday ? 'text-blue-600' : 'text-gray-700'
                                            }`}>
                                                {day}
                                            </div>
                                            
                                            <div className="space-y-0.5 sm:space-y-1 flex-grow">
                                                {visibleAppointments.map((appointment) => (
                                                    <div
                                                        key={appointment._id}
                                                        onClick={() => handlePatientClick(appointment.patientId, appointment)}
                                                        className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors border border-blue-200"
                                                    >
                                                        <div className="font-medium truncate text-xs leading-tight">
                                                            <span className="sm:hidden">{appointment.patientId.name.split(' ')[0]}</span>
                                                            <span className="hidden sm:inline">{appointment.patientId.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                                                            <DollarSign className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                                            <span className="truncate text-xs">₹{appointment.totalAmount}</span>
                                                            <span className={`ml-auto px-0.5 sm:px-1 rounded text-xs ${getPaymentStatus(appointment.totalAmount, appointment.paidAmount).color}`}>
                                                                {appointment.totalAmount === appointment.paidAmount ? '✓' : '!'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {hasMore && (
                                                <button
                                                    onClick={() => setViewingMoreDetails({ day, appointments: dayAppointments })}
                                                    className="w-full text-xs bg-gray-100 text-gray-600 px-0.5 sm:px-1 py-0.5 sm:py-1 mt-1 rounded hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center gap-0.5 sm:gap-1"
                                                >
                                                    <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                                                    <span className="text-xs">+{dayAppointments.length - maxVisible} more</span>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Statistics */}
                <div className="p-2 sm:p-4 md:p-5 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        <div className="bg-blue-50 p-2 sm:p-3 md:p-4 rounded-lg">
                            <div className="text-blue-600 text-xs sm:text-sm font-medium">Total</div>
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800">{currentMonthAppointments.length}</div>
                            <div className="text-xs text-blue-600 mt-1">Appointments</div>
                        </div>
                        <div className="bg-green-50 p-2 sm:p-3 md:p-4 rounded-lg">
                            <div className="text-green-600 text-xs sm:text-sm font-medium">Fully Paid</div>
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-800">{fullyPaidCount}</div>
                            <div className="text-xs text-green-600 mt-1">₹{totalPaid.toLocaleString()}</div>
                        </div>
                        <div className="bg-orange-50 p-2 sm:p-3 md:p-4 rounded-lg">
                            <div className="text-orange-600 text-xs sm:text-sm font-medium">Pending</div>
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800">
                                {currentMonthAppointments.length - fullyPaidCount}
                            </div>
                            <div className="text-xs text-orange-600 mt-1">₹{pendingAmount.toLocaleString()}</div>
                        </div>
                        <div className="bg-purple-50 p-2 sm:p-3 md:p-4 rounded-lg col-span-2 md:col-span-1">
                            <div className="text-purple-600 text-xs sm:text-sm font-medium">Total Revenue</div>
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-800">
                                ₹{totalRevenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-purple-600 mt-1">This Month</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Details Modal */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4">
                    <div className="bg-white rounded-lg sm:rounded-xl max-w-sm sm:max-w-lg md:max-w-2xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-y-auto m-1 sm:m-0">
                        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-1 sm:gap-2">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                                    Patient Details
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-6">
                            <div className="mb-4 sm:mb-6">
                                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Patient Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Name</label>
                                        <div className="text-gray-900 font-medium text-sm sm:text-base">{selectedPatient.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Age & Gender</label>
                                        <div className="text-gray-900 text-sm sm:text-base">{selectedPatient.age} years, {selectedPatient.gender}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Phone</label>
                                            <div className="text-gray-900 text-sm sm:text-base">{selectedPatient.phone}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Email</label>
                                            <div className="text-gray-900 text-sm sm:text-base break-all">{selectedPatient.email}</div>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 flex items-start gap-2">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-1" />
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Address</label>
                                            <div className="text-gray-900 text-sm sm:text-base">{selectedPatient.address}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Medical History</h4>
                                <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg">
                                    <div className="text-gray-900 text-sm sm:text-base">{selectedPatient.medicalHistory}</div>
                                </div>
                            </div>
                            {selectedPatient.appointment && (
                                <div className="mb-4 sm:mb-6">
                                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Appointment Details</h4>
                                    <div className="bg-blue-50 p-2 sm:p-3 md:p-4 rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-blue-600">Date</label>
                                                <div className="text-blue-900 font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    {formatDate(selectedPatient.appointment.appointmentDate)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-blue-600">Total Amount</label>
                                                <div className="text-blue-900 font-medium text-sm sm:text-base">
                                                    ₹{selectedPatient.appointment.totalAmount}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-blue-600">Paid Amount</label>
                                                <div className="text-green-600 font-medium text-sm sm:text-base">
                                                    ₹{selectedPatient.appointment.paidAmount}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-blue-600">Balance</label>
                                                <div className={`font-medium text-sm sm:text-base ${
                                                    selectedPatient.appointment.totalAmount === selectedPatient.appointment.paidAmount 
                                                        ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                    ₹{selectedPatient.appointment.totalAmount - selectedPatient.appointment.paidAmount}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {selectedPatient.appointment.notes && (
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-blue-600 flex items-center gap-1 sm:gap-2">
                                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    Notes
                                                </label>
                                                <div className="text-blue-900 mt-1 text-sm sm:text-base">{selectedPatient.appointment.notes}</div>
                                            </div>
                                        )}
                                        <div className="mt-3 sm:mt-4">
                                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                getPaymentStatus(selectedPatient.appointment.totalAmount, selectedPatient.appointment.paidAmount).color
                                            }`}>
                                                {getPaymentStatus(selectedPatient.appointment.totalAmount, selectedPatient.appointment.paidAmount).status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
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