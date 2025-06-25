const db = require("../Config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: "Role, email, and password are required." });
  }

  try {
    if (role === "admin") {
      if (email === "admin@gmail.com" && password === "admin123") {
        const token = jwt.sign({ role: "admin", id: "admin" }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        return res.status(200).json({ message: "Login successful", token });
      }
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    let table = role === "student" ? "student" : role === "teacher" ? "teacher" : null;
    if (!table) return res.status(400).json({ message: "Invalid role." });

    const [results] = await db.query(`SELECT ${role}_id as id, password FROM ${table} WHERE email = ?`, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign({ role, id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(200).json({ message: "Login successful", token });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { loginUser };
