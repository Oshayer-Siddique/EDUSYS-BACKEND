const express = require('express');
const router = express.Router();

const { getAllStudents,getStudentById,
    createStudent,deleteStudent,updateStudent} = require('../Controllers/studentController');





router.get('/', getAllStudents);
router.post('/create',createStudent);
router.get('/read/:id',getStudentById);
router.put('/update/:id',updateStudent);
router.delete('/delete/:id',deleteStudent);


module.exports = router