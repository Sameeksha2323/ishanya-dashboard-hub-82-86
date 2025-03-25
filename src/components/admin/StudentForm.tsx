
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatColumnName, isFieldRequired } from '@/utils/formEventUtils';
import DatePickerFormField from '@/components/ui/DatePickerFormField';
import EducatorSelect from './EducatorSelect';

interface StudentFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  lastStudentId?: number | null;
  centerId?: number;
  programId?: number;
}

const YEARS = Array.from({ length: 11 }, (_, i) => 2025 - i);
const GENDERS = ['Male', 'Female', 'Other'];
const STATUSES = ['Active', 'Inactive', 'On Leave', 'Graduated'];
const SESSION_TYPES = ['Online', 'Offline', 'Hybrid'];
const TRANSPORT_OPTIONS = ['Yes', 'No'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const StudentForm = ({ 
  onSubmit, 
  initialData = {}, 
  lastStudentId = null,
  centerId,
  programId
}: StudentFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  useEffect(() => {
    // Pre-fill student_id if it's a new record (and we have lastStudentId)
    if (!initialData.student_id && lastStudentId) {
      setFormData(prev => ({
        ...prev,
        student_id: lastStudentId + 1
      }));
    }
    
    // Pre-fill center_id and program_id if provided and not already set
    if (centerId && !formData.center_id) {
      setFormData(prev => ({
        ...prev,
        center_id: centerId
      }));
    }
    
    if (programId && !formData.program_id) {
      setFormData(prev => ({
        ...prev,
        program_id: programId
      }));
    }
    
    // If there's a photo URL in the initial data, set it as preview
    if (initialData.photo) {
      setPhotoPreview(initialData.photo);
    }
  }, [initialData, lastStudentId, centerId, programId]);
  
  const handleChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };
  
  const handleDateChange = (key: string, date: Date | undefined) => {
    setFormData({
      ...formData,
      [key]: date ? date.toISOString().split('T')[0] : null,
    });
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    
    setPhotoFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      const requiredFields = [
        'first_name', 'last_name', 'gender', 'dob', 'student_id', 
        'enrollment_year', 'status', 'student_email', 'program_id', 
        'educator_employee_id', 'contact_number', 'center_id'
      ];
      
      for (const field of requiredFields) {
        if (!formData[field] && formData[field] !== 0) {
          toast.error(`${formatColumnName(field)} is required`);
          setLoading(false);
          return;
        }
      }
      
      // Check if primary and secondary educators are the same
      if (formData.educator_employee_id && 
          formData.secondary_educator_employee_id && 
          formData.educator_employee_id === formData.secondary_educator_employee_id) {
        toast.error('Primary and secondary educators cannot be the same');
        setLoading(false);
        return;
      }
      
      // Process the photo upload if there's a new photo
      let photoUrl = formData.photo;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.student_id}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('student-photos')
          .upload(filePath, photoFile);
          
        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          toast.error('Failed to upload photo');
          setLoading(false);
          return;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('student-photos')
          .getPublicUrl(filePath);
          
        photoUrl = urlData.publicUrl;
      }
      
      // Prepare the final form data
      const finalFormData = {
        ...formData,
        photo: photoUrl,
      };
      
      // Delete created_at if present
      if ('created_at' in finalFormData) {
        delete finalFormData.created_at;
      }
      
      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student ID */}
        <div>
          <Label htmlFor="student_id">
            {formatColumnName('student_id')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="student_id"
            type="number"
            value={formData.student_id || ''}
            onChange={(e) => handleChange('student_id', parseInt(e.target.value) || '')}
            required
          />
        </div>
        
        {/* Center ID - Read-only if provided via props */}
        <div>
          <Label htmlFor="center_id">
            {formatColumnName('center_id')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="center_id"
            type="number"
            value={formData.center_id || ''}
            onChange={(e) => handleChange('center_id', parseInt(e.target.value) || '')}
            readOnly={!!centerId}
            required
          />
        </div>
        
        {/* Program ID - Read-only if provided via props */}
        <div>
          <Label htmlFor="program_id">
            {formatColumnName('program_id')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="program_id"
            type="number"
            value={formData.program_id || ''}
            onChange={(e) => handleChange('program_id', parseInt(e.target.value) || '')}
            readOnly={!!programId}
            required
          />
        </div>
        
        {/* First Name */}
        <div>
          <Label htmlFor="first_name">
            {formatColumnName('first_name')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="first_name"
            value={formData.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            required
          />
        </div>
        
        {/* Last Name */}
        <div>
          <Label htmlFor="last_name">
            {formatColumnName('last_name')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="last_name"
            value={formData.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            required
          />
        </div>
        
        {/* Gender - Dropdown */}
        <div>
          <Label htmlFor="gender">
            {formatColumnName('gender')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* DOB - Date Picker */}
        <DatePickerFormField
          label="DOB"
          value={formData.dob ? new Date(formData.dob) : undefined}
          onChange={(date) => handleDateChange('dob', date)}
          required
        />
        
        {/* Enrollment Year - Dropdown */}
        <div>
          <Label htmlFor="enrollment_year">
            {formatColumnName('enrollment_year')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={formData.enrollment_year?.toString() || ''}
            onValueChange={(value) => handleChange('enrollment_year', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status - Dropdown */}
        <div>
          <Label htmlFor="status">
            {formatColumnName('status')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={formData.status || ''}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Student Email */}
        <div>
          <Label htmlFor="student_email">
            {formatColumnName('student_email')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="student_email"
            type="email"
            value={formData.student_email || ''}
            onChange={(e) => handleChange('student_email', e.target.value)}
            required
          />
        </div>
        
        {/* Contact Number */}
        <div>
          <Label htmlFor="contact_number">
            {formatColumnName('contact_number')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="contact_number"
            value={formData.contact_number || ''}
            onChange={(e) => handleChange('contact_number', e.target.value)}
            required
          />
        </div>
        
        {/* Alternate Contact Number */}
        <div>
          <Label htmlFor="alt_contact_number">
            {formatColumnName('alt_contact_number')}
          </Label>
          <Input
            id="alt_contact_number"
            value={formData.alt_contact_number || ''}
            onChange={(e) => handleChange('alt_contact_number', e.target.value)}
          />
        </div>
        
        {/* Primary Educator - Custom Component */}
        <EducatorSelect
          label={formatColumnName('educator_employee_id')}
          value={formData.educator_employee_id}
          onChange={(value) => handleChange('educator_employee_id', value)}
          required
          centerId={formData.center_id}
          excludeEducatorId={formData.secondary_educator_employee_id}
        />
        
        {/* Secondary Educator - Custom Component */}
        <EducatorSelect
          label={formatColumnName('secondary_educator_employee_id')}
          value={formData.secondary_educator_employee_id}
          onChange={(value) => handleChange('secondary_educator_employee_id', value)}
          centerId={formData.center_id}
          excludeEducatorId={formData.educator_employee_id}
        />
        
        {/* Photo Upload */}
        <div>
          <Label htmlFor="photo">
            {formatColumnName('photo')}
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {photoPreview && (
            <div className="mt-2">
              <img 
                src={photoPreview} 
                alt="Student preview" 
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
        </div>
        
        {/* Blood Group - Dropdown */}
        <div>
          <Label htmlFor="blood_group">
            {formatColumnName('blood_group')}
          </Label>
          <Select
            value={formData.blood_group || ''}
            onValueChange={(value) => handleChange('blood_group', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Session Type - Dropdown */}
        <div>
          <Label htmlFor="session_type">
            {formatColumnName('session_type')}
          </Label>
          <Select
            value={formData.session_type || ''}
            onValueChange={(value) => handleChange('session_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select session type" />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Transport - Dropdown */}
        <div>
          <Label htmlFor="transport">
            {formatColumnName('transport')}
          </Label>
          <Select
            value={formData.transport || ''}
            onValueChange={(value) => handleChange('transport', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transport option" />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Address */}
        <div className="md:col-span-2">
          <Label htmlFor="address">
            {formatColumnName('address')}
          </Label>
          <Textarea
            id="address"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
          />
        </div>
        
        {/* UDID */}
        <div>
          <Label htmlFor="udid">
            {formatColumnName('udid')}
          </Label>
          <Input
            id="udid"
            value={formData.udid || ''}
            onChange={(e) => handleChange('udid', e.target.value)}
          />
        </div>
        
        {/* Parents' Names */}
        <div>
          <Label htmlFor="fathers_name">
            {formatColumnName('fathers_name')}
          </Label>
          <Input
            id="fathers_name"
            value={formData.fathers_name || ''}
            onChange={(e) => handleChange('fathers_name', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="mothers_name">
            {formatColumnName('mothers_name')}
          </Label>
          <Input
            id="mothers_name"
            value={formData.mothers_name || ''}
            onChange={(e) => handleChange('mothers_name', e.target.value)}
          />
        </div>
        
        {/* Parents' Email */}
        <div>
          <Label htmlFor="parents_email">
            {formatColumnName('parents_email')}
          </Label>
          <Input
            id="parents_email"
            type="email"
            value={formData.parents_email || ''}
            onChange={(e) => handleChange('parents_email', e.target.value)}
          />
        </div>
        
        {/* Medical Information */}
        <div className="md:col-span-2">
          <Label htmlFor="primary_diagnosis">
            {formatColumnName('primary_diagnosis')}
          </Label>
          <Textarea
            id="primary_diagnosis"
            value={formData.primary_diagnosis || ''}
            onChange={(e) => handleChange('primary_diagnosis', e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="comorbidity">
            {formatColumnName('comorbidity')}
          </Label>
          <Textarea
            id="comorbidity"
            value={formData.comorbidity || ''}
            onChange={(e) => handleChange('comorbidity', e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="allergies">
            {formatColumnName('allergies')}
          </Label>
          <Textarea
            id="allergies"
            value={formData.allergies || ''}
            onChange={(e) => handleChange('allergies', e.target.value)}
            rows={2}
          />
        </div>
        
        {/* Student Strengths & Weaknesses */}
        <div className="md:col-span-2">
          <Label htmlFor="strengths">
            {formatColumnName('strengths')}
          </Label>
          <Textarea
            id="strengths"
            value={formData.strengths || ''}
            onChange={(e) => handleChange('strengths', e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="weakness">
            {formatColumnName('weakness')}
          </Label>
          <Textarea
            id="weakness"
            value={formData.weakness || ''}
            onChange={(e) => handleChange('weakness', e.target.value)}
            rows={2}
          />
        </div>
        
        {/* Comments */}
        <div className="md:col-span-2">
          <Label htmlFor="comments">
            {formatColumnName('comments')}
          </Label>
          <Textarea
            id="comments"
            value={formData.comments || ''}
            onChange={(e) => handleChange('comments', e.target.value)}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
