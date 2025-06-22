const db = require("../Config/db")

async function getAllCourses(req, res) {
    try {
        const [results] = await db.promise().query('SELECT * FROM course');
        res.json(results);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
}

function createCourse(req, res) {
    const sql = 'INSERT INTO course (course_id, department_id, course_department, title, description) VALUES (?, ?, ?, ?, ?)';
    const { course_id, department_id, course_department, title, description } = req.body;

    // Validate input
    if (!course_id || !department_id || !course_department || !title) {
        return res.status(400).json({ message: 'Course ID, Department ID, Course Department, and Title are required.' });
    }

    // Check if the course_id is already taken
    db.query('SELECT * FROM course WHERE course_id = ?', [course_id], (err, results) => {
        if (err) {
            console.error('Error checking course_id:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Course ID already exists.' });
        }

        // Proceed to insert the course with the provided course_id
        db.query(sql, [course_id, department_id, course_department, title, description], (err, result) => {
            if (err) {
                console.error('Error inserting course:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }
            res.status(201).json({
                course_id,
                department_id,
                course_department,
                title,
                description
            });
        });
    });
}


//get by dept ID
async function getCourseById  (req, res) {
    const sql = 'SELECT * FROM course WHERE course_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};



// Update a department
async function updateCourse(req, res) {
    const { title, description, department_id, course_department } = req.body;
    const courseId = req.params.id;

    // Validate input (at least one field should be provided for update)
    if (!title && !description && !department_id && !course_department) {
        return res.status(400).json({ message: 'At least one field (department_id, course_department, title, description) must be provided for update.' });
    }

    // Build the update object dynamically
    const updatedCourse = {};
    if (title) updatedCourse.title = title;
    if (description) updatedCourse.description = description;
    if (department_id) updatedCourse.department_id = department_id;
    if (course_department) updatedCourse.course_department = course_department;

    const sql = 'UPDATE course SET ? WHERE course_id = ?';

    db.query(sql, [updatedCourse, courseId], (err, result) => {
        if (err) {
            console.error('Error updating course:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        res.json({ message: 'Course updated successfully', courseId });
    });
}



// Delete a department
async function deleteCourse(req, res){
    const sql = 'DELETE FROM course WHERE course_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Course deleted successfully' });
    });
};


async function getCoursesByStudentId(req, res) {
    const studentId = req.params.student_id;
    try {
        const query = `
            SELECT c.course_id, c.title
            FROM course c
            JOIN student_enroll se ON c.course_id = se.course_id
            WHERE se.student_id = ?
        `;
        const [results] = await db.promise().query(query, [studentId]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching courses for student:', error);
        res.status(500).json({ error: 'Failed to retrieve courses for student' });
    }
}





module.exports = { 
    getAllCourses,
    createCourse,
    updateCourse,
    getCourseById,
    deleteCourse,
    getCoursesByStudentId,


 };
