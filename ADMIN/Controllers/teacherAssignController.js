const db = require('../Config/db');

async function enrollMultipleTeachers(req, res) {
    const { course_id, teacher_id } = req.body;

    if (!course_id || !teacher_id) {
        return res.status(400).json({ message: 'Both Course ID and Teacher ID are required.' });
    }

    try {
        // Check if the course exists
        const [courseResults] = await db.promise().query('SELECT * FROM course WHERE course_id = ?', [course_id]);
        if (courseResults.length === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Check if the teacher exists
        const [teacherResults] = await db.promise().query('SELECT * FROM teacher WHERE teacher_id = ?', [teacher_id]);
        if (teacherResults.length === 0) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        // Check if the course is already assigned to another teacher
        const [existingAssignment] = await db.promise().query(
            'SELECT * FROM teacher_assignment WHERE course_id = ?',
            [course_id]
        );
        if (existingAssignment.length > 0) {
            return res.status(409).json({ message: 'This course is already assigned to a teacher.' });
        }

        // Assign the course to the teacher
        const enrollSql = 'INSERT INTO teacher_assignment (teacher_id, course_id) VALUES (?, ?)';
        await db.promise().query(enrollSql, [teacher_id, course_id]);

        res.status(201).json({ message: 'Teacher successfully assigned to course.' });
    } catch (error) {
        console.error('Error assigning teacher to course:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

async function unenrollTeacher(req, res) {
    const { teacher_id, course_id } = req.body;

    // Validate input
    if (!teacher_id || !course_id) {
        return res.status(400).json({ message: 'Teacher ID and Course ID are required.' });
    }

    // Delete the enrollment record
    const unenrollSql = 'DELETE FROM teacher_assignment WHERE teacher_id = ? AND course_id = ?';
    db.query(unenrollSql, [teacher_id, course_id], (err, result) => {
        if (err) {
            console.error('Error unenrolling teacher:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enrollment not found.' });
        }
        res.json({ message: 'Teacher unenrolled successfully' });
    });
}

async function getAllAssignments(req, res) {
    try {
        const [results] = await db.promise().query('SELECT * FROM teacher_assignment');
        res.json(results);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to retrieve assignments' });
    }
}

async function getCoursesForTeacher(req, res) {
    const teacherId = req.params.teacherId;
    const sql = `
        SELECT c.course_id, c.title, c.description, c.course_department
        FROM teacher_assignment ta
        JOIN course c ON ta.course_id = c.course_id
        WHERE ta.teacher_id = ?
    `;
    try {
        const [results] = await db.promise().query(sql, [teacherId]);
        if (results.length > 0) {
            const courses = results.map(course => {
                // Calculate the semester based on the second character of the course_id
                const semesterNumber = course.course_id.toString().charAt(1);
                let semester;
                switch (semesterNumber) {
                    case '1':
                        semester = 'First';
                        break;
                    case '2':
                        semester = 'Second';
                        break;
                    case '3':
                        semester = 'Third';
                        break;
                    case '4':
                        semester = 'Fourth';
                        break;
                    case '5':
                        semester = 'Fifth';
                        break;
                    case '6':
                        semester = 'Sixth';
                        break;
                    case '7':
                        semester = 'Seventh';
                        break;
                    case '8':
                        semester = 'Eighth';
                        break;
                    default:
                        semester = 'N/A';
                }

                // Set section to 1 or 2 (you can modify this logic if needed)
                const section = 1;

                // Set student count to 120
                const student_count = 120;

                return {
                    ...course,
                    section,
                    student_count,
                    semester
                };
            });
            res.json(courses);
        } else {
            res.status(404).json({ error: 'No courses found for the given teacher ID' });
        }
    } catch (error) {
        console.error('Error fetching courses for teacher:', error);
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
}

// New function to get the teacher ID by course ID
async function getTeacherByCourseId(req, res) {
    const { course_id } = req.params;

    try {
        const [results] = await db.promise().query('SELECT teacher_id FROM teacher_assignment WHERE course_id = ?', [course_id]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'No teacher found for the given course ID' });
        }
    } catch (error) {
        console.error('Error fetching teacher for course:', error);
        res.status(500).json({ error: 'Failed to retrieve teacher for course' });
    }
}

module.exports = {
    enrollMultipleTeachers,
    unenrollTeacher,
    getAllAssignments,
    getCoursesForTeacher,
    getTeacherByCourseId, // Export the new function
};