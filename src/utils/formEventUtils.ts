
/**
 * Utility functions for form-related events across the application
 */

/**
 * Opens the add record form for a specific table with prefilled data
 * 
 * @param tableName The name of the table to open the form for
 * @param formData The data to prefill the form with
 * @param sourceEntry Optional source entry for callback after form submission
 */
export const openAddRecordForm = (
  tableName: string, 
  formData: Record<string, any>,
  sourceEntry?: any
) => {
  window.dispatchEvent(new CustomEvent('openAddRecordForm', {
    detail: { 
      tableName,
      formData,
      sourceEntry
    } 
  }));
};

/**
 * Sets the form data for the currently open form
 * 
 * @param formData The data to set in the form
 */
export const setFormData = (formData: Record<string, any>) => {
  window.dispatchEvent(new CustomEvent('setFormData', {
    detail: { formData }
  }));
};

/**
 * Notifies listeners that a form was successfully submitted
 */
export const notifyFormSubmitSuccess = () => {
  window.dispatchEvent(new CustomEvent('formSubmitSuccess'));
};

/**
 * Adds a listener for when the add record form should be opened
 * 
 * @param tableName The table name to listen for
 * @param callback The callback to execute when the event is fired
 * @returns A cleanup function to remove the listener
 */
export const listenForAddRecordForm = (
  tableName: string,
  callback: (formData: Record<string, any>, sourceEntry?: any) => void
) => {
  const handleEvent = (event: CustomEvent) => {
    const { tableName: eventTableName, formData, sourceEntry } = event.detail;
    if (eventTableName === tableName) {
      callback(formData, sourceEntry);
    }
  };

  window.addEventListener('openAddRecordForm', handleEvent as EventListener);
  
  return () => {
    window.removeEventListener('openAddRecordForm', handleEvent as EventListener);
  };
};

/**
 * Adds a listener for when form data should be set
 * 
 * @param callback The callback to execute when the event is fired
 * @returns A cleanup function to remove the listener
 */
export const listenForFormData = (
  callback: (formData: Record<string, any>) => void
) => {
  const handleEvent = (event: CustomEvent) => {
    const { formData } = event.detail;
    callback(formData);
  };

  window.addEventListener('setFormData', handleEvent as EventListener);
  
  return () => {
    window.removeEventListener('setFormData', handleEvent as EventListener);
  };
};

/**
 * Adds a listener for when a form is successfully submitted
 * 
 * @param callback The callback to execute when the event is fired
 * @returns A cleanup function to remove the listener
 */
export const listenForFormSubmitSuccess = (callback: () => void) => {
  window.addEventListener('formSubmitSuccess', callback);
  
  return () => {
    window.removeEventListener('formSubmitSuccess', callback);
  };
};

/**
 * Format column names for better display
 * Converts snake_case to Title Case and handles special cases
 */
export const formatColumnName = (columnName: string): string => {
  // Handle special cases
  if (columnName.toLowerCase() === 'dob') return 'DOB';
  if (columnName.toLowerCase() === 'udid') return 'UDID';
  if (columnName.toLowerCase() === 'lor') return 'LOR';
  if (columnName === 'educator_employee_id') return 'Educator Name';
  if (columnName === 'secondary_educator_employee_id') return 'Secondary Educator Name';
  if (columnName === 'alt_contact_number') return 'Alternate Contact Number';
  
  // Replace underscores with spaces and capitalize first letter of each word
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Opens the voice input dialog for a specific table
 * 
 * @param tableName The name of the table to open the voice input for
 */
export const openVoiceInputDialog = (tableName: string) => {
  window.dispatchEvent(new CustomEvent('openVoiceInputDialog', {
    detail: { tableName }
  }));
};

/**
 * Adds a listener for when the voice input dialog should be opened
 * 
 * @param callback The callback to execute when the event is fired
 * @returns A cleanup function to remove the listener
 */
export const listenForVoiceInputDialog = (
  callback: (tableName: string) => void
) => {
  const handleEvent = (event: CustomEvent) => {
    const { tableName } = event.detail;
    callback(tableName);
  };

  window.addEventListener('openVoiceInputDialog', handleEvent as EventListener);
  
  return () => {
    window.removeEventListener('openVoiceInputDialog', handleEvent as EventListener);
  };
};

/**
 * Check if two educators are the same
 * 
 * @param primaryEducatorId The primary educator ID
 * @param secondaryEducatorId The secondary educator ID
 * @returns True if they are the same, false otherwise
 */
export const isSameEducator = (
  primaryEducatorId: number | null | undefined,
  secondaryEducatorId: number | null | undefined
): boolean => {
  if (!primaryEducatorId || !secondaryEducatorId) return false;
  return primaryEducatorId === secondaryEducatorId;
};

/**
 * Checks if a field is required based on table name and column name
 * 
 * @param tableName The name of the table
 * @param columnName The name of the column
 * @returns True if the field is required, false otherwise
 */
export const isFieldRequired = (tableName: string, columnName: string): boolean => {
  const requiredFields: Record<string, string[]> = {
    students: [
      'first_name', 'last_name', 'gender', 'dob', 'student_id', 'enrollment_year', 
      'status', 'student_email', 'program_id', 'educator_employee_id', 'contact_number', 'center_id'
    ],
    educators: [
      'center_id', 'employee_id', 'name', 'designation', 'email', 'phone', 
      'date_of_birth', 'date_of_joining', 'work_location'
    ],
    employees: [
      'employee_id', 'name', 'gender', 'designation', 'department', 'employment_type', 
      'email', 'phone', 'date_of_birth', 'date_of_joining', 'emergency_contact_name', 
      'emergency_contact', 'center_id', 'password'
    ]
  };
  
  return requiredFields[tableName]?.includes(columnName) || false;
};
