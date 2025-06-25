require("dotenv").config();
const express = require("express");
const app = express();




// Pick port from command line argument
const portArg = process.argv[2];
const PORT = process.env[portArg];
app.use(express.json()); // ✅ parses incoming JSON requests

if (!PORT) {
  console.error(`❌ Invalid or missing port key: ${portArg}`);
  process.exit(1);
}






const authRoutes = require("./Routes/authRoutes");

app.use(express.json());
app.use("/api/auth", authRoutes);




app.get('/', (req, res) => {
  res.send(`Hello from server running on port ${PORT}`);
});


app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

