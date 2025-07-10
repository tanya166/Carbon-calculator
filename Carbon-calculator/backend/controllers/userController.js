const User = require("../models/User");
const bcrypt = require("bcryptjs");

const submitContactForm = async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required" });
  }
  try {
    const result=await User.insertInTableContact(email,message);
    res.status(201).json({ message: "Your message has been received!" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  submitContactForm 
};