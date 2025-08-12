import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { PatientManagement } from "./components/PatientManagement";
import { AppointmentManagement } from "./components/AppoinmentManagement";
import { LoginScreen } from "./components/LoginScreen";
// Sample data
const samplePatients = Array.from({ length: 50 }, (_, i) => ({
  _id: `patient_${i + 1}`,
  name: `Patient ${i + 1}`,
  age: 25 + (i % 50),
  gender: ["male", "female", "other"][i % 3],
  address: `Address ${i + 1}, City`,
  phoneNumber: 1234567890 + i,
  email: `patient${i + 1}@email.com`,
}));

const sampleAppointments = Array.from({ length: 100 }, (_, i) => ({
  _id: `appointment_${i + 1}`,
  patientId: samplePatients[i % 50]._id,
  patientName: samplePatients[i % 50].name,
  totalAmount: 500 + (i % 10) * 100,
  paidAmount: 300 + (i % 8) * 50,
  appointmentDate: new Date(2024, Math.floor(i / 10), (i % 30) + 1),
  notes: `Session notes for appointment ${i + 1}`,
  timestamp: new Date(2024, Math.floor(i / 10), (i % 30) + 1),
}));

// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentView("dashboard");
    setSelectedPatient(null);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view !== "appointments") {
      setSelectedPatient(null);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  if (!localStorage.getItem("token")) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {currentView === "dashboard" && (
        <Dashboard
          patients={samplePatients}
          appointments={sampleAppointments}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === "patients" && (
        <PatientManagement
          onNavigate={handleNavigate}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {currentView === "appointments" && (
        <AppointmentManagement
          selectedPatient={selectedPatient}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default App;
