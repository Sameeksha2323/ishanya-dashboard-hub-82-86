
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Search, Filter } from 'lucide-react';

type Student = {
  id: string;
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  center_id: number;
  program_id: number;
  center_name?: string;
  program_name?: string;
};

type Center = {
  center_id: number;
  name: string;
};

type Program = {
  program_id: number;
  name: string;
};

const StudentPerformance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, student_id, first_name, last_name, gender, center_id, program_id');

        if (studentsError) throw studentsError;

        // Fetch centers
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('center_id, name');

        if (centersError) throw centersError;

        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('program_id, name');

        if (programsError) throw programsError;

        // Map center names and program names to students
        const studentsWithDetails = studentsData.map((student: Student) => {
          const center = centersData.find((c: Center) => c.center_id === student.center_id);
          const program = programsData.find((p: Program) => p.program_id === student.program_id);
          
          return {
            ...student,
            center_name: center?.name || 'Unknown Center',
            program_name: program?.name || 'Unknown Program'
          };
        });

        setStudents(studentsWithDetails);
        setFilteredStudents(studentsWithDetails);
        setCenters(centersData);
        setPrograms(programsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever search query or dropdown selections change
    let result = [...students];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => 
        student.first_name.toLowerCase().includes(query) || 
        student.last_name.toLowerCase().includes(query)
      );
    }

    // Apply center filter
    if (selectedCenter) {
      result = result.filter(student => student.center_id === parseInt(selectedCenter));
    }

    // Apply program filter
    if (selectedProgram) {
      result = result.filter(student => student.program_id === parseInt(selectedProgram));
    }

    setFilteredStudents(result);
  }, [searchQuery, selectedCenter, selectedProgram, students]);

  return (
    <Layout
      title="Student Performance"
      subtitle="Search and view student performance records"
      showBackButton
      onBack={() => window.history.back()}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Select value={selectedCenter} onValueChange={setSelectedCenter}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Filter by center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Centers</SelectItem>
                {centers.map((center) => (
                  <SelectItem key={center.center_id} value={center.center_id.toString()}>
                    {center.center_id} - {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.program_id} value={program.program_id.toString()}>
                    {program.program_id} - {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No students found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Link 
                to={`/admin/student-details/${student.student_id}`} 
                key={student.id}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-ishanya-green">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">
                      {student.first_name} {student.last_name}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Student ID: {student.student_id}</p>
                      <p>Gender: {student.gender}</p>
                      <p className="mt-2 text-xs inline-block bg-gray-100 px-2 py-1 rounded">
                        Center: {student.center_name}
                      </p>
                      <p className="mt-1 text-xs inline-block bg-gray-100 px-2 py-1 rounded">
                        Program: {student.program_name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentPerformance;
