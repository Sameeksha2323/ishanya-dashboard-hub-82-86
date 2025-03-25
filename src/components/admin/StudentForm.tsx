
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FileUpload from '@/components/ui/file-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerFormField } from '@/components/ui/DatePickerFormField';
import { fetchCenters, fetchProgramsByCenter } from '@/lib/api';

const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  gender: z.string().min(1, 'Gender is required'),
  dob: z.string().nullable().optional(),
  student_id: z.string().optional(),
  enrollment_year: z.coerce.number().min(1990, 'Invalid year').max(2100, 'Invalid year').optional(),
  status: z.string().default('Active'),
  center_id: z.coerce.number().min(1, 'Center is required'),
  program_id: z.coerce.number().min(1, 'Program is required'),
  program_2_id: z.coerce.number().optional().nullable(),
  student_email: z.string().email('Invalid email').optional().nullable(),
  educator_employee_id: z.coerce.number().optional().nullable(),
  secondary_educator_employee_id: z.coerce.number().optional().nullable(),
  session_type: z.string().optional().nullable(),
  number_of_sessions: z.coerce.number().optional().nullable(),
  timings: z.string().optional().nullable(),
  days_of_week: z.string().optional().nullable(),
  fathers_name: z.string().optional().nullable(),
  mothers_name: z.string().optional().nullable(),
  primary_diagnosis: z.string().optional().nullable(),
  comorbidity: z.string().optional().nullable(),
  udid: z.string().optional().nullable(),
  blood_group: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  contact_number: z.string().min(1, 'Contact number is required'),
  alt_contact_number: z.string().optional().nullable(),
  parents_email: z.string().email('Invalid email').optional().nullable(),
  address: z.string().optional().nullable(),
  transport: z.string().optional().nullable(),
  strengths: z.string().optional().nullable(),
  weakness: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormValues) => Promise<void>;
  lastStudentId: number | null;
  centerId?: number | null;
  programId?: number | null;
  initialValues?: Partial<StudentFormValues>;
}

const StudentForm = ({ onSubmit, lastStudentId, centerId, programId, initialValues }: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [educators, setEducators] = useState<any[]>([]);

  const defaultValues: Partial<StudentFormValues> = {
    first_name: '',
    last_name: '',
    gender: '',
    dob: null,
    student_id: lastStudentId ? `STU${(lastStudentId + 1).toString().padStart(4, '0')}` : '',
    enrollment_year: new Date().getFullYear(),
    status: 'Active',
    center_id: centerId || undefined,
    program_id: programId || undefined,
    student_email: '',
    program_2_id: null,
    contact_number: '',
    parents_email: '',
    ...initialValues
  };

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues
  });

  const watchCenterId = form.watch('center_id');

  useEffect(() => {
    const loadCenters = async () => {
      try {
        const centersData = await fetchCenters();
        if (centersData) {
          setCenters(centersData);
        }
      } catch (error) {
        console.error('Error loading centers:', error);
        toast.error('Failed to load centers');
      }
    };

    loadCenters();
  }, []);

  useEffect(() => {
    if (watchCenterId) {
      const loadPrograms = async () => {
        try {
          const programsData = await fetchProgramsByCenter(watchCenterId);
          if (programsData) {
            setPrograms(programsData);
          }
        } catch (error) {
          console.error('Error loading programs:', error);
          toast.error('Failed to load programs');
        }
      };

      const loadEducators = async () => {
        try {
          const { data, error } = await supabase
            .from('educators')
            .select('*')
            .eq('center_id', watchCenterId);

          if (error) {
            throw error;
          }

          setEducators(data || []);
        } catch (error) {
          console.error('Error loading educators:', error);
          toast.error('Failed to load educators');
        }
      };

      loadPrograms();
      loadEducators();
    }
  }, [watchCenterId]);

  const handleFormSubmit = async (values: StudentFormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
      form.reset(defaultValues);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (url: string) => {
    form.setValue('photo', url);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <DatePickerFormField
                field={field}
                label="Date of Birth"
                placeholder="Select date of birth"
              />
            )}
          />

          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input placeholder="Student ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enrollment_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enrollment Year</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enrollment year" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="center_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Center *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('program_id', '');
                    form.setValue('educator_employee_id', null);
                  }} 
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem 
                        key={center.center_id} 
                        value={center.center_id.toString()}
                      >
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="program_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Program *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                  disabled={!watchCenterId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchCenterId ? "Select program" : "Select center first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem 
                        key={program.program_id} 
                        value={program.program_id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="program_2_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Program (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                  disabled={!watchCenterId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchCenterId ? "Select secondary program" : "Select center first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {programs.map((program) => (
                      <SelectItem 
                        key={program.program_id} 
                        value={program.program_id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Contact Information */}
          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="alt_contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="Alternate contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parents_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent's Email</FormLabel>
                <FormControl>
                  <Input placeholder="Parent's email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="student_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Email</FormLabel>
                <FormControl>
                  <Input placeholder="Student email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Photo Upload */}
        <div className="mt-4">
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo</FormLabel>
                <FormControl>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    value={field.value || ''}
                    bucket="student-photos"
                    accept="image/*"
                    fileType="image"
                    entityType="student"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Medical Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <FormField
            control={form.control}
            name="primary_diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Diagnosis</FormLabel>
                <FormControl>
                  <Input placeholder="Primary diagnosis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comorbidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comorbidity</FormLabel>
                <FormControl>
                  <Input placeholder="Comorbidity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="udid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UDID</FormLabel>
                <FormControl>
                  <Input placeholder="UDID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blood_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <FormControl>
                  <Input placeholder="Blood group" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allergies</FormLabel>
                <FormControl>
                  <Input placeholder="Allergies" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Family Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <FormField
            control={form.control}
            name="fathers_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Father's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mothers_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mother's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Session Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <FormField
            control={form.control}
            name="educator_employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Educator</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                  disabled={!watchCenterId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchCenterId ? "Select educator" : "Select center first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {educators.map((educator) => (
                      <SelectItem 
                        key={educator.employee_id} 
                        value={educator.employee_id.toString()}
                      >
                        {educator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_educator_employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Educator</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                  disabled={!watchCenterId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={watchCenterId ? "Select secondary educator" : "Select center first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {educators.map((educator) => (
                      <SelectItem 
                        key={educator.employee_id} 
                        value={educator.employee_id.toString()}
                      >
                        {educator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="session_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number_of_sessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Sessions</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Number of sessions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="days_of_week"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days of Week</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Monday,Wednesday,Friday" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timings</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 9:00 AM - 10:30 AM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <FormField
            control={form.control}
            name="transport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="School Transport">School Transport</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes and Comments */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          <FormField
            control={form.control}
            name="strengths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Strengths</FormLabel>
                <FormControl>
                  <Textarea placeholder="Student's strengths" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weakness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Areas for Improvement</FormLabel>
                <FormControl>
                  <Textarea placeholder="Areas for improvement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Comments</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional comments" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={loading}>
          {loading ? 'Saving...' : 'Save Student'}
        </Button>
      </form>
    </Form>
  );
};

export default StudentForm;
