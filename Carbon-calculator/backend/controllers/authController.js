require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const usernameTaken = await User.usernameExists(username);
    if (usernameTaken) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const emailTaken = await User.emailExists(email);
    if (emailTaken) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.insertInTable(username,email,hashedPassword);

    const newUser = await User.findByUsername(username);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },// payload(data)
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, userId: newUser.id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const email=await User.getEmailFromUsername(username);
    console.log("Fetched email:", email);
    res.status(200).json({ token, userId: user.id ,email,username:user.username});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports={signup,login}
