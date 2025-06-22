const express = require('express');
const router = express.Router();

const { 
    getAllTeachers, 
    getTeacherById, 
    createTeacher, 
    updateTeacher, 
    deleteTeacher
} = require('../Controllers/teacherController');

router.get('/', getAllTeachers);
router.post('/create', createTeacher);
router.get('/read/:id', getTeacherById);
router.put('/update/:id', updateTeacher);
router.delete('/delete/:id', deleteTeacher);


module.exports = router;
