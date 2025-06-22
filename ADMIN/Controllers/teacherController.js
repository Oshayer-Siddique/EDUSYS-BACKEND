const db = require("../Config/db");

// Get all teachers
async function getAllTeachers(req, res) {
    try {
        const [results] = await db.promise().query('SELECT * FROM teacher');
        res.json(results);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Failed to retrieve teachers' });
    }
}

// Create a new teacher
async function createTeacher(req, res) {
    const sql = `
        INSERT INTO teacher (teacher_id, department_id, name, email, password, designation, date_of_birth, blood_group, department_name, address, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const {
        teacher_id,
        department_id,
        name,
        email,
        password,
        designation,
        date_of_birth,
        blood_group,
        department_name,
        address,
        phone_number
    } = req.body;

    // Validate required input fields
    if (!teacher_id || !department_id || !name || !email || !password || !designation) {
        return res.status(400).json({ message: 'Teacher ID, department ID, name, email, password, and designation are required.' });
    }

    // Check if the email or teacher_id is already taken
    db.query('SELECT * FROM teacher WHERE email = ? OR teacher_id = ?', [email, teacher_id], (err, results) => {
        if (err) {
            console.error('Error checking email or teacher ID:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email or Teacher ID already exists.' });
        }

        // Proceed to insert the new teacher with teacher_id and additional fields
        db.query(sql, [teacher_id, department_id, name, email, password, designation, date_of_birth, blood_group, department_name, address, phone_number], (err, result) => {
            if (err) {
                console.error('Error inserting teacher:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }
            res.status(201).json({ id: teacher_id, department_id, name, email });
        });
    });
}

// Get a teacher by ID
async function getTeacherById(req, res) {
    const sql = 'SELECT * FROM teacher WHERE teacher_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error fetching teacher:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }
        res.json(result);
    });
}

// Update a teacher
async function updateTeacher(req, res) {
    const {
        teacher_id,
        department_id,
        name,
        email,
        password,
        designation,
        date_of_birth,
        blood_group,
        department_name,
        address,
        phone_number
    } = req.body;
    const currentTeacherId = req.params.id; // The original teacher ID from the URL parameters

    // Validate input
    if (!teacher_id && !department_id && !name && !email && !password && !designation && !date_of_birth && !blood_group && !department_name && !address && !phone_number) {
        return res.status(400).json({ message: 'At least one field (teacher_id, department_id, name, email, password, designation, etc.) must be provided for update.' });
    }

    // Build the update object dynamically
    const updatedTeacher = {};
    if (teacher_id) updatedTeacher.teacher_id = teacher_id;
    if (department_id) updatedTeacher.department_id = department_id;
    if (name) updatedTeacher.name = name;
    if (email) updatedTeacher.email = email;
    if (password) updatedTeacher.password = password;
    if (designation) updatedTeacher.designation = designation;
    if (date_of_birth) updatedTeacher.date_of_birth = date_of_birth;
    if (blood_group) updatedTeacher.blood_group = blood_group;
    if (department_name) updatedTeacher.department_name = department_name;
    if (address) updatedTeacher.address = address;
    if (phone_number) updatedTeacher.phone_number = phone_number;

    // Check if changing the teacher_id and if it already exists
    if (teacher_id && teacher_id !== currentTeacherId) {
        // Check for unique teacher_id
        db.query('SELECT * FROM teacher WHERE teacher_id = ?', [teacher_id], (err, results) => {
            if (err) {
                console.error('Error checking new teacher_id:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: 'Teacher ID already exists.' });
            }

            // Proceed to update the teacher
            const sql = 'UPDATE teacher SET ? WHERE teacher_id = ?';
            db.query(sql, [updatedTeacher, currentTeacherId], (err, result) => {
                if (err) {
                    console.error('Error updating teacher:', err);
                    return res.status(500).json({ message: 'Internal server error.' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Teacher not found.' });
                }

                // Update the teacher_id if it was changed
                const updateIdSql = 'UPDATE teacher SET teacher_id = ? WHERE teacher_id = ?';
                db.query(updateIdSql, [teacher_id, currentTeacherId], (err) => {
                    if (err) {
                        console.error('Error updating teacher ID:', err);
                        return res.status(500).json({ message: 'Internal server error.' });
                    }
                    res.json({ message: 'Teacher updated successfully', teacherId: teacher_id });
                });
            });
        });
    } else {
        // Proceed to update the teacher without changing teacher_id
        const sql = 'UPDATE teacher SET ? WHERE teacher_id = ?';
        db.query(sql, [updatedTeacher, currentTeacherId], (err, result) => {
            if (err) {
                console.error('Error updating teacher:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Teacher not found.' });
            }

            res.json({ message: 'Teacher updated successfully', teacherId: currentTeacherId });
        });
    }
}

// Delete a teacher
async function deleteTeacher(req, res) {
    const sql = 'DELETE FROM teacher WHERE teacher_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting teacher:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json({ message: 'Teacher deleted successfully' });
    });
}
module.exports = {
    getAllTeachers,
    createTeacher,
    getTeacherById,
    updateTeacher,
    deleteTeacher
};
// This code defines a controller for managing teachers in an educational system.
// It includes functions to get all teachers, create a new teacher, get a teacher by ID,
// update a teacher, and delete a teacher. Each function interacts with a MySQL database
// using prepared statements to prevent SQL injection and ensure data integrity.
