
-- This function is not needed anymore as we're using a standard query instead
-- CREATE OR REPLACE FUNCTION get_students_by_program()
-- RETURNS TABLE (
--   name TEXT,
--   total_students BIGINT
-- ) 
-- LANGUAGE SQL
-- AS $$
--   SELECT programs.name, COUNT(*) AS total_students
--   FROM students
--   JOIN programs ON students.program_id = programs.program_id
--   GROUP BY programs.name
--   ORDER BY programs.name;
-- $$;

