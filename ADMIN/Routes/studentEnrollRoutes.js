const express = require('express');
const router = express.Router();

const { enrollMultipleStudents,
        unenrollStudent,
        getAllEnrollments,
        getCoursesByStudentId,
        getStudentCountByCourse} = require('../Controllers/studentEnrollController');


router.post('/enroll',enrollMultipleStudents);
router.delete('/unenroll',unenrollStudent);
router.get('/enrollments',getAllEnrollments);
router.get('/enrollments/:student_id',getCoursesByStudentId);
router.get('/student-count/:course_id',getStudentCountByCourse);

module.exports = router;


