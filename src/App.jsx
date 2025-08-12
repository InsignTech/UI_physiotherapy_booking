import React, { useState, useEffect } from 'react';
import { Calendar, Search, Users, Eye, Plus, Edit, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { login } from './services/userApi';
import { addPatient, updatePatient } from './services/patientApi';
// Sample data
const samplePatients = Array.from({ length: 50 }, (_, i) => ({
  _id: `patient_${i + 1}`,
  name: `Patient ${i + 1}`,
  age: 25 + (i % 50),
  gender: ['male', 'female', 'other'][i % 3],
  address: `Address ${i + 1}, City`,
  phoneNumber: 1234567890 + i,
  email: `patient${i + 1}@email.com`
}));

const sampleAppointments = Array.from({ length: 100 }, (_, i) => ({
  _id: `appointment_${i + 1}`,
  patientId: samplePatients[i % 50]._id,
  patientName: samplePatients[i % 50].name,
  totalAmount: 500 + (i % 10) * 100,
  paidAmount: 300 + (i % 8) * 50,
  appointmentDate: new Date(2024, Math.floor(i / 10), (i % 30) + 1),
  notes: `Session notes for appointment ${i + 1}`,
  timestamp: new Date(2024, Math.floor(i / 10), (i % 30) + 1)
}));

// Login Component
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await login({ email, password });
    localStorage.setItem("token", res.data); 
    onLogin();
  } catch (error) {
    alert(error.response?.data?.msg || "invalid username or password");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Physio Portal</h1>
          <p className="text-gray-600 mt-2">Welcome back, Doctor</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="doctor@clinic.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ patients, appointments, onNavigate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.paidAmount, 0);
  const pendingAmount = appointments.reduce((sum, apt) => sum + (apt.totalAmount - apt.paidAmount), 0);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Today\'s Appointments',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: Eye,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Amount',
      value: `₹${pendingAmount.toLocaleString()}`,
      icon: Filter,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your physiotherapy practice portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('patients')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Manage Patients
            </button>
            <button
              onClick={() => onNavigate('appointments')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              View Appointments
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Appointments</h2>
          <div className="space-y-3">
            {todayAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{appointment.patientName}</p>
                  <p className="text-sm text-gray-600">₹{appointment.totalAmount}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No appointments today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Management Component
const PatientManagement = ({ onNavigate, onSelectPatient }) => {
  const [patients, setPatients] = useState(samplePatients);
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
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
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
                        <Edit onClick={} />
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

// Add Patient Form Component
// Add Patient Form Component with API Integration
const AddPatientForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    phoneNumber: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        phoneNumber: parseInt(formData.phoneNumber)
      };

      // Call the API to add patient
      const response = await addPatient(patientData);
      
      // If API call is successful, call the onSubmit callback with the response data
      onSubmit(response.data || patientData);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        address: '',
        phoneNumber: '',
        email: ''
      });
      
    } catch (error) {
      // Handle API errors
      alert(error.response?.data?.message || error.message || "Failed to add patient. Please try again.");
      console.error('Error adding patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Patient</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="md:col-span-2 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
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

// Appointment Management Component
const AppointmentManagement = ({ selectedPatient, onNavigate }) => {
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const itemsPerPage = 10;

  let filteredAppointments = selectedPatient
    ? appointments.filter(apt => apt.patientId === selectedPatient._id)
    : appointments;

  if (searchDate) {
    const searchDateObj = new Date(searchDate);
    filteredAppointments = filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === searchDateObj.toDateString();
    });
  }

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

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
            setPatients(patients.map(p =>
                p._id === editingPatient._id ? { ...p, ...updatedPatientData } : p
            ));
            setEditingPatient(null);
            alert("Patient updated successfully!");
        } catch (error) {
            alert("Failed to update patient.");
        }
    };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {selectedPatient && (
            <button
              onClick={() => onNavigate('patients')}
              className="text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedPatient ? `${selectedPatient.name}'s Appointments` : 'All Appointments'}
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
          patients={samplePatients}
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
                onClick={() => setSearchDate('')}
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
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Patient</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Total Amount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Paid Amount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Balance</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{appointment.patientName}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">₹{appointment.totalAmount}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">₹{appointment.paidAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${appointment.totalAmount === appointment.paidAmount 
                      ? 'text-green-600' : 'text-orange-600'}`}>
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

// Add Appointment Form Component
const AddAppointmentForm = ({ onSubmit, onCancel, patients, selectedPatient }) => {
  const [formData, setFormData] = useState({
    patientId: selectedPatient?._id || '',
    totalAmount: '',
    paidAmount: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p._id === formData.patientId);
    onSubmit({
      ...formData,
      patientName: patient?.name || '',
      totalAmount: parseInt(formData.totalAmount),
      paidAmount: parseInt(formData.paidAmount),
      appointmentDate: new Date(formData.appointmentDate)
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Appointment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
          <select
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={selectedPatient}
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>{patient.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
          <input
            type="date"
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
          <input
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
          <input
            type="number"
            value={formData.paidAmount}
            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

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

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Physio Portal</h1>
          </div>
          
          <div className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    setSelectedPatient(null);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view !== 'appointments') {
      setSelectedPatient(null);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
      />
      
      {currentView === 'dashboard' && (
        <Dashboard 
          patients={samplePatients}
          appointments={sampleAppointments}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentView === 'patients' && (
        <PatientManagement 
          onNavigate={handleNavigate}
          onSelectPatient={handleSelectPatient}
        />
      )}
      
      {currentView === 'appointments' && (
        <AppointmentManagement 
          selectedPatient={selectedPatient}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default App