
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { trackDatabaseChange } from '@/utils/dbTracking';

type PayrollFormProps = {
  employeeId: number;
  onSuccess: () => void;
  initialData?: {
    id?: string;
    current_salary?: number;
    last_paid?: string;
  };
  onCancel?: () => void;
};

const PayrollForm = ({ employeeId, onSuccess, initialData, onCancel }: PayrollFormProps) => {
  const [currentSalary, setCurrentSalary] = useState<number | undefined>(
    initialData?.current_salary
  );
  
  const [lastPaidDate, setLastPaidDate] = useState<Date | undefined>(
    initialData?.last_paid ? new Date(initialData.last_paid) : undefined
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSalary) {
      toast.error('Current salary is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payrollData = {
        employee_id: employeeId,
        current_salary: currentSalary,
        last_paid: lastPaidDate ? format(lastPaidDate, 'yyyy-MM-dd') : null
      };
      
      let error = null;
      
      if (initialData?.id) {
        // Update existing payroll record
        const { error: updateError } = await supabase
          .from('employee_payroll')
          .update(payrollData)
          .eq('id', initialData.id);
          
        error = updateError;
      } else {
        // Insert new payroll record
        const { error: insertError } = await supabase
          .from('employee_payroll')
          .insert(payrollData);
          
        error = insertError;
      }
      
      if (error) {
        throw error;
      }
      
      // Track the database change
      await trackDatabaseChange('employee_payroll', initialData?.id ? 'update' : 'insert');
      
      toast.success(initialData?.id ? 'Payroll information updated' : 'Payroll information saved', { duration: 3000 });
      onSuccess();
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast.error('Failed to save payroll information', { duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit Payroll Information' : 'Add Payroll Information'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_salary">Current Salary <span className="text-red-500">*</span></Label>
            <Input
              id="current_salary"
              type="number"
              value={currentSalary || ''}
              onChange={(e) => setCurrentSalary(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter current salary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_paid">Last Paid Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !lastPaidDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastPaidDate ? format(lastPaidDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastPaidDate}
                  onSelect={setLastPaidDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update' : 'Save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PayrollForm;
