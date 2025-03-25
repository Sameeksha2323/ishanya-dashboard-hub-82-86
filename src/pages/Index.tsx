
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CenterList from '@/components/centers/CenterList';
import { Center, Program, fetchCenters } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataManager from '@/components/admin/DataManager';
import PendingReviews from '@/components/admin/PendingReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Users, GraduationCap } from 'lucide-react';
import ProgramList from '@/components/programs/ProgramList';
import TableListWrapper from '@/components/tables/TableListWrapper';
import FilteredTableView from '@/components/tables/FilteredTableView';
import AnnouncementBoard from '@/components/announcements/AnnouncementBoard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEducators: 0,
    totalEmployees: 0
  });

  // Navigation state
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);

  useEffect(() => {
    const loadCenters = async () => {
      try {
        const centersData = await fetchCenters();
        if (centersData) {
          setCenters(centersData);
          
          // Calculate total stats
          const totalStudents = centersData.reduce((sum, center) => sum + (center.num_of_student || 0), 0);
          const totalEducators = centersData.reduce((sum, center) => sum + (center.num_of_educator || 0), 0);
          const totalEmployees = centersData.reduce((sum, center) => sum + (center.num_of_employees || 0), 0);
          
          setStats({
            totalStudents,
            totalEducators,
            totalEmployees
          });
        }
      } catch (error) {
        console.error('Error fetching centers:', error);
        toast.error('Failed to load centers');
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  const handleSelectCenter = (center: Center) => {
    setSelectedCenter(center);
    setSelectedProgram(null);
    setSelectedTable(null);
  };

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setSelectedTable(null);
  };

  const handleSelectTable = (table: any) => {
    setSelectedTable(table);
  };

  const handleBack = () => {
    if (selectedTable) {
      setSelectedTable(null);
    } else if (selectedProgram) {
      setSelectedProgram(null);
    } else if (selectedCenter) {
      setSelectedCenter(null);
    }
  };

  const renderContent = () => {
    if (selectedTable && selectedProgram) {
      return <FilteredTableView table={selectedTable} />;
    }
    
    if (selectedProgram) {
      return (
        <TableListWrapper 
          program={selectedProgram} 
          onSelectTable={handleSelectTable} 
          selectedTable={selectedTable}
        />
      );
    }
    
    if (selectedCenter) {
      return <ProgramList center={selectedCenter} onSelectProgram={handleSelectProgram} />;
    }
    
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button
            variant="default"
            className="bg-ishanya-green hover:bg-ishanya-green/80 text-white"
            onClick={() => navigate("/admin/student-performance")}
          >
            View Student Performance
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-ishanya-green">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-ishanya-green" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ishanya-green">{stats.totalStudents}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-ishanya-yellow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-ishanya-yellow" />
                Total Educators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ishanya-yellow">{stats.totalEducators}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-500">{stats.totalEmployees}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Add PendingReviews component */}
        <PendingReviews />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CenterList onSelectCenter={handleSelectCenter} />
          </div>
          
          <div>
            <AnnouncementBoard />
          </div>
        </div>
        
        <DataManager />
      </>
    );
  };

  if (loading) {
    return (
      <Layout
        title="Loading..."
        subtitle="Please wait while we fetch the centers"
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={selectedTable ? selectedTable.display_name || selectedTable.name : 
           selectedProgram ? selectedProgram.name : 
           selectedCenter ? selectedCenter.name : 
           "Admin Dashboard"}
      subtitle={selectedTable ? "Manage data" : 
              selectedProgram ? "Select a table" : 
              selectedCenter ? "Select a program" : 
              "Manage centers and programs"}
      showBackButton={!!selectedCenter}
      onBack={handleBack}
    >
      {renderContent()}
    </Layout>
  );
};

export default Index;
