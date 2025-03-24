
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, IndianRupee, CalendarClock, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PayrollForm from './PayrollForm';
import { format } from 'date-fns';

type EmployeePayrollProps = {
  employeeId: number;
};

type PayrollData = {
  id: string;
  employee_id: number;
  current_salary: number;
  last_paid?: string;
};

const EmployeePayroll = ({ employeeId }: EmployeePayrollProps) => {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .order('last_paid', { ascending: false });

      if (error) {
        console.error('Error fetching payroll data:', error);
      }

      setPayrollData(data as PayrollData[] || []);
    } catch (error) {
      console.error('Error in fetchPayrollData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchPayrollData();
    }
  }, [employeeId]);

  const handleEditPayroll = (data: PayrollData) => {
    setSelectedPayroll(data);
    setIsAddingNew(false);
    setShowEditDialog(true);
  };

  const handleAddPayroll = () => {
    setSelectedPayroll(null);
    setIsAddingNew(true);
    setShowEditDialog(true);
  };

  const handleDialogClose = () => {
    setShowEditDialog(false);
    setSelectedPayroll(null);
    setIsAddingNew(false);
  };

  const handlePayrollSaved = () => {
    fetchPayrollData();
    setShowEditDialog(false);
    setSelectedPayroll(null);
    setIsAddingNew(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not recorded';
    return format(new Date(dateString), 'PPP');
  };

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
        <CardTitle className="text-lg font-medium flex items-center">
          <IndianRupee className="h-5 w-5 mr-2 text-primary" />
          Payroll Information
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddPayroll} className="hover:bg-slate-200">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : payrollData.length > 0 ? (
          <div className="space-y-8">
            {payrollData.map((payroll) => (
              <div key={payroll.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-md font-medium">{formatDate(payroll.last_paid)}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditPayroll(payroll)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <IndianRupee className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Salary</p>
                    <p className="text-xl font-bold">{formatCurrency(payroll.current_salary)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex justify-center items-center p-4 bg-primary/10 rounded-full mb-4">
              <IndianRupee className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No payroll information</h3>
            <p className="text-muted-foreground mb-4">
              No payroll records have been added for this employee yet.
            </p>
            <Button 
              onClick={handleAddPayroll} 
              className="mt-2"
              size="lg"
            >
              Add Payroll Details
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isAddingNew ? 'Add Payroll Information' : 'Edit Payroll Information'}
            </DialogTitle>
          </DialogHeader>
          <PayrollForm
            employeeId={employeeId}
            initialData={selectedPayroll || undefined}
            onSuccess={handlePayrollSaved}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeePayroll;
