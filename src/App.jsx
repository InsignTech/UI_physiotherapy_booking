import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { PatientManagement } from "./components/PatientManagement";
import { AppointmentManagement } from "./components/AppoinmentManagement";
import { LoginScreen } from "./components/LoginScreen";
import {AppointmentCalendarMonitor} from './components/AppointmentCalendarMonitor'

const App = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/patients"
            element={
              <PatientManagement
                onNavigate={() => {}}
                onSelectPatient={handleSelectPatient}
              />
            }
          />
          <Route
            path="/appointments"
            element={
              <AppointmentManagement
                selectedPatient={selectedPatient}
                onNavigate={() => {}}
              />
            }
          />
          <Route path="*" element={<Navigate to="/appointments" />} />
          <Route path="/calendar" element={<AppointmentCalendarMonitor />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
