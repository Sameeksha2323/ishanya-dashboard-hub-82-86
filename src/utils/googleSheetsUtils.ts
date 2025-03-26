
import axios from 'axios';

// Base URL for your API
const API_BASE_URL = 'https://ishanya-sheet-api.onrender.com/api';

export const fetchSheetData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getSheetData`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
};

export const deleteSheetRow = async (rowIndex: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/deleteRow/${rowIndex}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting row:', error);
    throw error;
  }
};

export const formatStudentDataFromSheet = (sheetData: any) => {
  // Transform the sheet data to match the expected student data structure
  const studentData = {
    first_name: sheetData.firstName || '',
    last_name: sheetData.lastName || '',
    gender: sheetData.gender || '',
    dob: sheetData.dob || '',
    student_email: sheetData.email || '',
    fathers_name: sheetData.fatherName || '',
    mothers_name: sheetData.motherName || '',
    primary_diagnosis: sheetData.diagnosis || '',
    comorbidity: sheetData.comorbidities || '',
    blood_group: sheetData.bloodGroup || '',
    allergies: sheetData.allergies || '',
    contact_number: sheetData.contactNumber || '',
    alt_contact_number: sheetData.altContactNumber || '',
    parents_email: sheetData.parentEmail || '',
    address: sheetData.address || '',
    transport: sheetData.transport || '',
    strengths: sheetData.strengths || '',
    weakness: sheetData.weaknesses || '',
    comments: sheetData.comments || '',
    // Required fields that might need default values
    center_id: sheetData.centerId || 1,
    program_id: sheetData.programId || 1,
    enrollment_year: new Date().getFullYear(),
    status: 'Active',
    educator_employee_id: sheetData.educatorId || 1,
  };
  
  return studentData;
};
