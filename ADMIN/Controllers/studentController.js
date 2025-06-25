const db = require("../Config/db")
const bcrypt = require("bcrypt");

async function getAllStudents(req, res) {
    try {
        const [results] = await db.promise().query('SELECT * FROM student');
        res.json(results);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to retrieve student' });
    }
}

async function createStudent(req, res) {
    const sql = `
        INSERT INTO student (student_id, name, email, password, address, date_of_birth, department, phone_number, blood_group)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { student_id, name, email, password, address, date_of_birth, department, phone_number, blood_group } = req.body;

    if (!student_id || !name || !email || !password) {
        return res.status(400).json({ message: 'Student ID, name, email, and password are required.' });
    }

    try {
        const [existing] = await db.promise().query(
            'SELECT * FROM student WHERE email = ? OR student_id = ?',
            [email, student_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email or Student ID already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 🔐 hash password

        await db.promise().query(sql, [
            student_id,
            name,
            email,
            hashedPassword,
            address,
            date_of_birth,
            department,
            phone_number,
            blood_group
        ]);

        res.status(201).json({
            id: student_id,
            name,
            email,
            password: '[ENCRYPTED]',
            address,
            date_of_birth,
            department,
            phone_number,
            blood_group
        });

    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

async function getStudentById(req, res) {
    const sql = 'SELECT * FROM student WHERE student_id = ?';
    try {
        const [result] = await db.promise().query(sql, [req.params.id]);
        if (result.length > 0) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to retrieve student' });
    }
}


//update a student
async function updateStudent(req, res) {
    const { student_id, name, email, password, address, date_of_birth, department, phone_number, blood_group } = req.body;
    const currentStudentId = req.params.id; // The original student ID from the URL parameters

    // Validate input: at least one field must be provided
    if (!name && !email && !password && !student_id && !address && !date_of_birth && !department && !phone_number && !blood_group) {
        return res.status(400).json({ message: 'At least one field must be provided for update.' });
    }

    // Build the update object dynamically
    const updatedStudent = {};
    if (name) updatedStudent.name = name;
    if (email) updatedStudent.email = email;
    if (password) updatedStudent.password = await bcrypt.hash(password, 10); // 🔐 hash new password
    if (address) updatedStudent.address = address;
    if (date_of_birth) updatedStudent.date_of_birth = date_of_birth;
    if (department) updatedStudent.department = department;
    if (phone_number) updatedStudent.phone_number = phone_number;
    if (blood_group) updatedStudent.blood_group = blood_group;

    // Check if changing the student_id and if it already exists
    if (student_id && student_id !== currentStudentId) {
        // Check for unique student_id
        db.query('SELECT * FROM student WHERE student_id = ?', [student_id], (err, results) => {
            if (err) {
                console.error('Error checking new student_id:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: 'Student ID already exists.' });
            }

            // Proceed to update the student data
            const sql = 'UPDATE student SET ? WHERE student_id = ?';
            db.query(sql, [updatedStudent, currentStudentId], (err, result) => {
                if (err) {
                    console.error('Error updating student:', err);
                    return res.status(500).json({ message: 'Internal server error.' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Student not found.' });
                }

                // Update the student_id if it was changed
                const updateIdSql = 'UPDATE student SET student_id = ? WHERE student_id = ?';
                db.query(updateIdSql, [student_id, currentStudentId], (err) => {
                    if (err) {
                        console.error('Error updating student ID:', err);
                        return res.status(500).json({ message: 'Internal server error.' });
                    }
                    res.json({ message: 'Student updated successfully', studentId: student_id });
                });
            });
        });
    } else {
        // Proceed to update the student without changing student_id
        const sql = 'UPDATE student SET ? WHERE student_id = ?';
        db.query(sql, [updatedStudent, currentStudentId], (err, result) => {
            if (err) {
                console.error('Error updating student:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Student not found.' });
            }

            res.json({ message: 'Student updated successfully', studentId: currentStudentId });
        });
    }
}



// Delete a student
async function deleteStudent(req, res){
    const sql = 'DELETE FROM student WHERE student_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Student deleted successfully' });
    });
};


module.exports = { 
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,

 };
