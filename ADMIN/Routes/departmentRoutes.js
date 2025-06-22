const express = require('express');
const router = express.Router();
const { getAllDepartments,getDepartmentById,
    createDepartment,deleteDepartment,updateDepartment } = require('../Controllers/departmentControllers')




router.get('/', getAllDepartments);
router.post('/create',createDepartment);
router.get('/read/:id',getDepartmentById);
router.put('/update/:id',updateDepartment);
router.delete('/delete/:id',deleteDepartment);

module.exports = router;