import { PATIENT_INSTANCE } from "./axiosInstance"; // using your existing instance


export const addPatient = async (patientData) => {
  try {
    console.log(patientData)
    const response = await PATIENT_INSTANCE.post("/", patientData);

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllPatients = async (page = 1, limit = 10) => {
  try {
    const response = await PATIENT_INSTANCE.get("/", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const searchPatients = async (query) => {
  try {
    console.log(query)
    const response = await PATIENT_INSTANCE.get("/search", {
      params: {query },
    });
    console.log("res",response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePatient = async (id, patientData) => {
  try {
    const response = await PATIENT_INSTANCE.put(`/${id}`, patientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePatient = async (id) => {
  try {
    const response = await PATIENT_INSTANCE.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments for a patient (with pagination)
export const getPatientAppointments = async (id, page, limit, date) => {
  try {
    const params = { page, limit };
    if (id) params.id = id;
    if (date) params.date = date;
    const response = await PATIENT_INSTANCE.get("/getAllAppointmnets", { params });
    console.log("appoin",response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboard = async () => {
  try {
    const response = await PATIENT_INSTANCE.get(`/dashboard`);
    console.log("dsfsdfsdfsd",response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// Add an appointment for a patient
export const addAppointment = async (appointmentData) => {
  try {
    const response = await PATIENT_INSTANCE.post(`/getAllAppointmnets`, appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update appointment details
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await PATIENT_INSTANCE.put(`/appointments/${appointmentId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    console.log(appointmentId)
    const response = await PATIENT_INSTANCE.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all appointments (not just for one patient)
export const getAllAppointments = async () => {
  try {
    const response = await PATIENT_INSTANCE.get(`/appointments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};




