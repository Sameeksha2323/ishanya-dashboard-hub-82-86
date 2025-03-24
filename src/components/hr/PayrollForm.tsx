
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

type PayrollFormProps = {
  employeeId: number;
  onSuccess: () => void;
  initialData?: {
    current_salary?: number;
    last_paid?: string;
  };
};

const PayrollForm = ({ employeeId, onSuccess, initialData }: PayrollFormProps) => {
  const [currentSalary, setCurrentSalary] = useState<number | undefined>(
    initialData?.current_salary
  );
  
  const [lastPaidDate, setLastPaidDate] = useState<Date | undefined>(
    initialData?.last_paid ? new Date(initialData.last_paid) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('employee_payroll')
        .upsert({
          employee_id: employeeId,
          current_salary: currentSalary,
          last_paid: lastPaidDate ? format(lastPaidDate, 'yyyy-MM-dd') : null
        }, { onConflict: 'employee_id' });
      
      if (error) {
        throw error;
      }
      
      toast.success('Payroll information saved');
      onSuccess();
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast.error('Failed to save payroll information');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Information</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_salary">Current Salary</Label>
            <Input
              id="current_salary"
              type="number"
              value={currentSalary || ''}
              onChange={(e) => setCurrentSalary(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter current salary"
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PayrollForm;
