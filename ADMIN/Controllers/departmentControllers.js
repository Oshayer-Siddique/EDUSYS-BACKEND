const db = require("../Config/db");
// Get all departments

async function getAllDepartments(req, res) {
    try {
        const [results] = await db.promise().query('SELECT * FROM department');
        res.json(results);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to retrieve departments' });
    }
}

//create dept
// Create a new department
async function createDepartment(req, res) {
    const sql = 'INSERT INTO department (department_id, name, location, dept_email) VALUES (?, ?, ?, ?)';
    const { department_id, name, location, dept_email } = req.body;

    // Validate required input fields
    if (!department_id || !name || !dept_email) {
        return res.status(400).json({ message: 'Department ID, name, and department email are required.' });
    }

    try {
        // Check if the department email is already in use
        const [existingDepartments] = await db.promise().query('SELECT * FROM department WHERE dept_email = ?', [dept_email]);
        if (existingDepartments.length > 0) {
            return res.status(400).json({ message: 'Department email already exists.' });
        }

        // Proceed to insert the new department
        const [result] = await db.promise().query(sql, [department_id, name, location, dept_email]);
        res.status(201).json({ department_id, name, location, dept_email });
    } catch (err) {
        console.error('Error inserting department:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


//get by dept ID
async function getDepartmentById  (req, res) {
    const sql = 'SELECT * FROM department WHERE department_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};



// Update a department
// Update a department
async function updateDepartment(req, res) {
    const { name, location, dept_email } = req.body;
    const departmentId = req.params.id; // The department ID from the URL parameters

    // Validate input
    if (!name && !location && !dept_email) {
        return res.status(400).json({ message: 'At least one field (name, location, dept_email) must be provided for update.' });
    }

    // Build the update object dynamically
    const updatedDepartment = {};
    if (name) updatedDepartment.name = name;
    if (location) updatedDepartment.location = location;
    if (dept_email) updatedDepartment.dept_email = dept_email;

    // Check if the new department email already exists
    if (dept_email) {
        db.query('SELECT * FROM department WHERE dept_email = ? AND department_id != ?', [dept_email, departmentId], (err, results) => {
            if (err) {
                console.error('Error checking department email:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: 'Department email already exists.' });
            }

            // Proceed to update the department
            const sql = 'UPDATE department SET ? WHERE department_id = ?';
            db.query(sql, [updatedDepartment, departmentId], (err, result) => {
                if (err) {
                    console.error('Error updating department:', err);
                    return res.status(500).json({ message: 'Internal server error.' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Department not found.' });
                }

                res.json({ message: 'Department updated successfully' });
            });
        });
    } else {
        // If no dept_email is being updated, proceed to update the department
        const sql = 'UPDATE department SET ? WHERE department_id = ?';
        db.query(sql, [updatedDepartment, departmentId], (err, result) => {
            if (err) {
                console.error('Error updating department:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Department not found.' });
            }

            res.json({ message: 'Department updated successfully' });
        });
    }
}



// Delete a department
async function deleteDepartment(req, res){
    const sql = 'DELETE FROM department WHERE department_id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Department deleted successfully' });
    });
};





module.exports = { 
    getAllDepartments,
    createDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,



 };
