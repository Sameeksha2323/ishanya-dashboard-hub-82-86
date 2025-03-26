
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import DatePickerFormField from '@/components/ui/DatePickerFormField';

// Define types for props
interface StudentFormProps {
  onSubmit: (data: any) => Promise<void>;
  lastStudentId: number | null;
  centerId?: number | null;
  programId?: number | null;
  initialData?: Record<string, any>;
}

// Define schema for form validation
const studentFormSchema = z.object({
  student_id: z.number().or(z.string().transform(val => parseInt(val, 10))),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.date().optional(),
  primary_diagnosis: z.string().optional(),
  comorbidity: z.string().optional(),
  udid: z.string().optional(),
  fathers_name: z.string().optional(),
  mothers_name: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  contact_number: z.string().min(1, "Contact number is required"),
  alt_contact_number: z.string().optional(),
  parents_email: z.string().email().optional(),
  address: z.string().optional(),
  enrollment_year: z.number().min(1000, "Valid year required").max(3000, "Valid year required"),
  status: z.string().min(1, "Status is required"),
  student_email: z.string().email().optional(),
  center_id: z.number(),
  program_id: z.number(),
  educator_employee_id: z.number().optional(),
  secondary_educator_employee_id: z.number().optional(),
  program_2_id: z.number().optional(),
  timings: z.string().optional(),
  session_type: z.string().optional(),
  transport: z.string().optional(),
  days_of_week: z.array(z.string()).optional(),
  strengths: z.string().optional(),
  weakness: z.string().optional(),
  comments: z.string().optional(),
});

const StudentForm = ({ onSubmit, lastStudentId, centerId, programId, initialData }: StudentFormProps) => {
  const [centers, setCenters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [educators, setEducators] = useState<any[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<any[]>([]);
  const [filteredEducators, setFilteredEducators] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      student_id: lastStudentId ? lastStudentId + 1 : 1001,
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      gender: initialData?.gender || '',
      dob: initialData?.dob ? new Date(initialData.dob) : undefined,
      primary_diagnosis: initialData?.primary_diagnosis || '',
      comorbidity: initialData?.comorbidity || '',
      udid: initialData?.udid || '',
      fathers_name: initialData?.fathers_name || '',
      mothers_name: initialData?.mothers_name || '',
      blood_group: initialData?.blood_group || '',
      allergies: initialData?.allergies || '',
      contact_number: initialData?.contact_number || '',
      alt_contact_number: initialData?.alt_contact_number || '',
      parents_email: initialData?.parents_email || '',
      address: initialData?.address || '',
      enrollment_year: initialData?.enrollment_year || new Date().getFullYear(),
      status: initialData?.status || 'Active',
      student_email: initialData?.student_email || '',
      center_id: initialData?.center_id || centerId || 0,
      program_id: initialData?.program_id || programId || 0,
      educator_employee_id: initialData?.educator_employee_id || undefined,
      secondary_educator_employee_id: initialData?.secondary_educator_employee_id || undefined,
      program_2_id: initialData?.program_2_id || undefined,
      timings: initialData?.timings || '',
      session_type: initialData?.session_type || '',
      transport: initialData?.transport || '',
      days_of_week: initialData?.days_of_week || [],
      strengths: initialData?.strengths || '',
      weakness: initialData?.weakness || '',
      comments: initialData?.comments || '',
    },
  });
  
  // Update form values when lastStudentId or initialData changes
  useEffect(() => {
    if (lastStudentId && !initialData?.student_id) {
      form.setValue('student_id', lastStudentId + 1);
    }
    
    if (centerId) {
      form.setValue('center_id', centerId);
    }
    
    if (programId) {
      form.setValue('program_id', programId);
    }
  }, [lastStudentId, centerId, programId, form, initialData]);
  
  // Fetch centers, programs, and educators on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch centers
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('*');
          
        if (centersError) {
          console.error('Error fetching centers:', centersError);
          return;
        }
        
        setCenters(centersData || []);
        
        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*');
          
        if (programsError) {
          console.error('Error fetching programs:', programsError);
          return;
        }
        
        setPrograms(programsData || []);
        
        // Initial filter for programs based on centerId
        if (centerId) {
          setFilteredPrograms(programsData?.filter(p => p.center_id === centerId) || []);
        } else {
          setFilteredPrograms(programsData || []);
        }
        
        // Fetch educators
        const { data: educatorsData, error: educatorsError } = await supabase
          .from('educators')
          .select('*');
          
        if (educatorsError) {
          console.error('Error fetching educators:', educatorsError);
          return;
        }
        
        setEducators(educatorsData || []);
        
        // Initial filter for educators based on centerId
        if (centerId) {
          setFilteredEducators(educatorsData?.filter(e => e.center_id === centerId) || []);
        } else {
          setFilteredEducators(educatorsData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, [centerId]);
  
  // Filter programs and educators when center changes
  const handleCenterChange = (centerId: number) => {
    form.setValue('center_id', centerId);
    
    // Filter programs by centerId
    const filtered = programs.filter(program => program.center_id === centerId);
    setFilteredPrograms(filtered);
    
    // Filter educators by centerId
    const filteredEduactors = educators.filter(educator => educator.center_id === centerId);
    setFilteredEducators(filteredEduactors);
    
    // Reset program and educator selection
    form.setValue('program_id', 0);
    form.setValue('educator_employee_id', undefined);
  };
  
  // Handle form submission
  const handleFormSubmit = async (data: z.infer<typeof studentFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert form data to match database schema
      const formattedData = {
        ...data,
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : null,
      };
      
      await onSubmit(formattedData);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="number" readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                  <FormItem>
                    <DatePickerFormField
                      label="Date of Birth"
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enrollment_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Year <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1900" max="2100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <FormField
                control={form.control}
                name="center_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={(value) => handleCenterChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centers.map((center) => (
                          <SelectItem key={center.center_id} value={center.center_id.toString()}>
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
                    <FormLabel>Program <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={(value) => form.setValue('program_id', parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredPrograms.map((program) => (
                          <SelectItem key={program.program_id} value={program.program_id.toString()}>
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
                name="educator_employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Educator</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select educator" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredEducators.map((educator) => (
                          <SelectItem key={educator.employee_id} value={educator.employee_id.toString()}>
                            {educator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Medical Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="primary_diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Diagnosis</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fathers_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <FormLabel>Student Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
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
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Session Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="timings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Timings</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 9:00 AM - 11:00 AM" />
                    </FormControl>
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Group">Group</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="transport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="School Transport">School Transport</SelectItem>
                        <SelectItem value="Own Transport">Own Transport</SelectItem>
                        <SelectItem value="Public Transport">Public Transport</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strengths</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
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
                      <Textarea {...field} rows={3} />
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
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudentForm;
