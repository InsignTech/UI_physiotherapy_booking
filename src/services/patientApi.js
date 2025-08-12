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

export const searchPatients = async (name, phoneNumber) => {
  try {
    const response = await PATIENT_INSTANCE.get("/search", {
      params: { name, phoneNumber },
    });
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
export const getPatientAppointments = async (id, page = 1, limit = 10) => {
  try {
    const response = await PATIENT_INSTANCE.get(`/${id}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getDashboard = async () => {
  try {
    const response = await PATIENT_INSTANCE.get(`/dashboard`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

