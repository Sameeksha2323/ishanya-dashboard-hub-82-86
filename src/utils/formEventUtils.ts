
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
  // Remove created_at if it exists since the database will handle it
  if (formData.created_at) {
    delete formData.created_at;
  }
  
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
  // Remove created_at if it exists since the database will handle it
  if (formData.created_at) {
    delete formData.created_at;
  }
  
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
 * Formats a column name for display by capitalizing each word and handling special cases
 * 
 * @param columnName The column name to format
 * @returns The formatted column name
 */
export const formatColumnName = (columnName: string): string => {
  // Special case for ID fields
  if (columnName.toLowerCase() === 'id' || columnName.endsWith('_id')) {
    // Handle common ID patterns
    const baseName = columnName.replace(/_id$/, '');
    if (baseName === columnName) {
      return 'ID';
    }
    return formatColumnName(baseName) + ' ID';
  }
  
  // Special case for DOB
  if (columnName.toLowerCase() === 'dob') {
    return 'DOB';
  }
  
  // Special case for LOR
  if (columnName.toLowerCase() === 'lor') {
    return 'LOR';
  }
  
  // Special acronyms that should be all caps
  const acronyms = ['lor', 'url', 'udid'];
  if (acronyms.includes(columnName.toLowerCase())) {
    return columnName.toUpperCase();
  }
  
  // Handle general case: split by underscore and capitalize each word
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
