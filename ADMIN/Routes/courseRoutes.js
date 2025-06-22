const express = require('express');
const router = express.Router();

const { getAllCourses,getCourseById,
    createCourse,deleteCourse,updateCourse,getCoursesByStudentId } = require('../Controllers/courseController');





router.get('/', getAllCourses);
router.post('/create',createCourse);
router.get('/read/:id',getCourseById);
router.put('/update/:id',updateCourse);
router.delete('/delete/:id',deleteCourse);
router.get('/student/:student_id',getCoursesByStudentId);

module.exports = router;
