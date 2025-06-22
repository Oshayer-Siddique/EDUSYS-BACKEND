require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const db = require('./Config/db')




//all routes
const departmentRoutes = require('./Routes/departmentRoutes');
const courseRoutes = require('./Routes/courseRoutes');
const studentRoutes = require('./Routes/studentRoutes');
const teacherRoutes = require('./Routes/teacherRoutes');
const studentEnrollRoutes = require('./Routes/studentEnrollRoutes');
const teacherAssignRoutes = require('./Routes/teacherAssignRoutes');






const app = express();



app.use(express.json());



// Pick port from command line argument
const portArg = process.argv[2];
const PORT = process.env[portArg];
app.use(express.json()); // ✅ parses incoming JSON requests

if (!PORT) {
  console.error(`❌ Invalid or missing port key: ${portArg}`);
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send(`Hello from server running on port ${PORT}`);
});

app.use('/departments', departmentRoutes);
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/studentenroll', studentEnrollRoutes);
app.use('/teacherassign', teacherAssignRoutes);







app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
